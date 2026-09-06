from datetime import timedelta
from decimal import Decimal
import requests
import math

from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Avg, Count, F, Q
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, Cart, CartItem, Category, Coupon, CouponUsage, CustomizationRequest, DeliveryServiceArea, LocationDiscount, Order, OrderItem, PincodeLocation, Product, Review, SupportMessage, SupportTicket, WishlistItem, WishlistCollection, WishlistCollectionItem
from .serializers import (AddressSerializer, AdminSupportTicketDetailSerializer, AdminSupportTicketListSerializer, AdminUpdateSupportTicketSerializer, CartItemSerializer, CategorySerializer, CreateSupportTicketSerializer, CustomizationRequestSerializer, OrderSerializer, ProductSerializer, RegisterSerializer, ReviewSerializer, SupportMessageCreateSerializer, SupportMessageSerializer, SupportTicketDetailSerializer, SupportTicketListSerializer, UserSerializer, WishlistItemSerializer, WishlistCollectionSerializer, WishlistCollectionDetailSerializer, WishlistCollectionPublicSerializer, WishlistCollectionItemSerializer)


def annotated_products():
    return Product.objects.filter(is_available=True).annotate(average_rating=Avg("reviews__rating"), review_count=Count("reviews"))


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        q = annotated_products()
        p = self.request.query_params
        if p.get("search"): q = q.filter(Q(name__icontains=p["search"]) | Q(description__icontains=p["search"]))
        for field in ("category", "metal_type", "purity", "gender"):
            value = p.get(field) or p.get(field.replace("_type", ""))
            if value: q = q.filter(**{f"{field}__iexact": value})
        if p.get("min_price"): q = q.filter(price__gte=p["min_price"])
        if p.get("max_price"): q = q.filter(price__lte=p["max_price"])
        if p.get("available") == "true": q = q.filter(stock__gt=0)
        if p.get("rating"): q = q.filter(average_rating__gte=p["rating"])
        if p.get("discount") == "true": q = q.filter(original_price__gt=0).filter(original_price__gt=F("price"))
        sort = p.get("sort", "newest")
        return q.order_by({"price_asc": "price", "price_desc": "-price", "popular": "-review_count", "best_rated": "-average_rating", "newest": "-created_at"}.get(sort, "-created_at"))


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    queryset = annotated_products()


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.filter(is_active=True)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        user = serializer.save(); token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email, password = request.data.get("email", ""), request.data.get("password", "")
        user = authenticate(request, username=email, password=password)
        if not user: return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request): return Response(UserSerializer(request.user).data)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response({"items": CartItemSerializer(cart.items.select_related("product").all(), many=True).data})


class CartItemCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = CartItemSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        product, quantity = serializer.validated_data["product"], serializer.validated_data["quantity"]
        if not product.is_available or quantity > product.stock: return Response({"detail": "Requested quantity is unavailable."}, status=400)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity = min(item.quantity + quantity, product.stock); item.save()
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return CartItem.objects.filter(cart__user=self.request.user).select_related("product")
    def perform_update(self, serializer):
        product = self.get_object().product; quantity = serializer.validated_data.get("quantity", 1)
        if quantity > product.stock: raise serializers.ValidationError({"quantity": "Only available stock may be added."})
        serializer.save()


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request): return Response(WishlistItemSerializer(WishlistItem.objects.filter(user=request.user).select_related("product"), many=True).data)
    def post(self, request):
        serializer = WishlistItemSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=serializer.validated_data["product"])
        return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class WishlistDetailView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return WishlistItem.objects.filter(user=self.request.user)


class AddressListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            addresses = Address.objects.filter(user=request.user)
            serializer = AddressSerializer(addresses, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in AddressListView GET: {str(e)}")
            return Response({"detail": "Error fetching addresses", "error": str(e)}, status=500)
    
    def post(self, request):
        try:
            serializer = AddressSerializer(data=request.data)
            if serializer.is_valid():
                address = serializer.save(user=request.user)
                return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=400)
        except Exception as e:
            print(f"Error in AddressListView POST: {str(e)}")
            return Response({"detail": "Error creating address", "error": str(e)}, status=500)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class CustomizationRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            requests_list = CustomizationRequest.objects.filter(user=request.user)
            return Response(CustomizationRequestSerializer(requests_list, many=True).data)
        except Exception as e:
            print(f"Error in CustomizationRequestView GET: {str(e)}")
            return Response({"detail": "Error fetching customization requests", "error": str(e)}, status=500)
    
    def post(self, request):
        try:
            serializer = CustomizationRequestSerializer(data=request.data)
            if serializer.is_valid():
                customization = serializer.save(user=request.user)
                return Response(CustomizationRequestSerializer(customization).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=400)
        except Exception as e:
            print(f"Error in CustomizationRequestView POST: {str(e)}")
            return Response({"detail": "Error creating customization request", "error": str(e)}, status=500)


class CustomizationRequestDetailView(generics.RetrieveAPIView):
    serializer_class = CustomizationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CustomizationRequest.objects.filter(user=self.request.user)


def calculate_location_discount(address, subtotal):
    matches = [d for d in LocationDiscount.objects.filter(active=True) if d.applies_to(address)]
    return max((subtotal * d.discount_percentage / 100 for d in matches), default=Decimal("0"))


def get_pincode_details(pincode):
    try:
        pincode = str(pincode)
        response = requests.get(
            f"https://api.postalpincode.in/pincode/{pincode}", 
            timeout=5, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        response.raise_for_status()
        data = response.json()
        if data and isinstance(data, list) and len(data) > 0:
            first_result = data[0]
            if first_result.get("Status") == "Success" and first_result.get("PostOffice"):
                post_office = first_result["PostOffice"][0]
                return {
                    "pincode": pincode,
                    "city": post_office.get("District", ""),
                    "district": post_office.get("District", ""),
                    "state": post_office.get("State", ""),
                    "country": post_office.get("Country", "India"),
                    "raw_response": first_result
                }
    except requests.RequestException as e:
        print(f"Error fetching pincode data from API: {e}")
    except Exception as e:
        print(f"Unexpected error in get_pincode_details: {e}")
    
    # Fallback for development when Postal API is unreachable
    fallback_data = {
        "803101": {
            "pincode": "803101",
            "city": "Bihar Sharif",
            "district": "Nalanda",
            "state": "Bihar",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Nalanda", "State": "Bihar", "Country": "India"}]}
        },
        "800001": {
            "pincode": "800001",
            "city": "Patna",
            "district": "Patna",
            "state": "Bihar",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Patna", "State": "Bihar", "Country": "India"}]}
        },
        "110001": {
            "pincode": "110001",
            "city": "New Delhi",
            "district": "Central Delhi",
            "state": "Delhi",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Central Delhi", "State": "Delhi", "Country": "India"}]}
        },
        "400001": {
            "pincode": "400001",
            "city": "Mumbai",
            "district": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Mumbai", "State": "Maharashtra", "Country": "India"}]}
        },
        "560001": {
            "pincode": "560001",
            "city": "Bengaluru",
            "district": "Bengaluru Urban",
            "state": "Karnataka",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Bengaluru Urban", "State": "Karnataka", "Country": "India"}]}
        },
        "700001": {
            "pincode": "700001",
            "city": "Kolkata",
            "district": "Kolkata",
            "state": "West Bengal",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Kolkata", "State": "West Bengal", "Country": "India"}]}
        },
        "600001": {
            "pincode": "600001",
            "city": "Chennai",
            "district": "Chennai",
            "state": "Tamil Nadu",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Chennai", "State": "Tamil Nadu", "Country": "India"}]}
        },
        "500001": {
            "pincode": "500001",
            "city": "Hyderabad",
            "district": "Hyderabad",
            "state": "Telangana",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Hyderabad", "State": "Telangana", "Country": "India"}]}
        },
        "411001": {
            "pincode": "411001",
            "city": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Pune", "State": "Maharashtra", "Country": "India"}]}
        },
        "302001": {
            "pincode": "302001",
            "city": "Jaipur",
            "district": "Jaipur",
            "state": "Rajasthan",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Jaipur", "State": "Rajasthan", "Country": "India"}]}
        },
        "380001": {
            "pincode": "380001",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "state": "Gujarat",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Ahmedabad", "State": "Gujarat", "Country": "India"}]}
        },
        "226001": {
            "pincode": "226001",
            "city": "Lucknow",
            "district": "Lucknow",
            "state": "Uttar Pradesh",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Lucknow", "State": "Uttar Pradesh", "Country": "India"}]}
        },
        "462001": {
            "pincode": "462001",
            "city": "Bhopal",
            "district": "Bhopal",
            "state": "Madhya Pradesh",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Bhopal", "State": "Madhya Pradesh", "Country": "India"}]}
        },
        "160001": {
            "pincode": "160001",
            "city": "Chandigarh",
            "district": "Chandigarh",
            "state": "Chandigarh",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Chandigarh", "State": "Chandigarh", "Country": "India"}]}
        },
        "751001": {
            "pincode": "751001",
            "city": "Bhubaneswar",
            "district": "Khordha",
            "state": "Odisha",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Khordha", "State": "Odisha", "Country": "India"}]}
        },
        "248001": {
            "pincode": "248001",
            "city": "Dehradun",
            "district": "Dehradun",
            "state": "Uttarakhand",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Dehradun", "State": "Uttarakhand", "Country": "India"}]}
        },
        "834001": {
            "pincode": "834001",
            "city": "Ranchi",
            "district": "Ranchi",
            "state": "Jharkhand",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Ranchi", "State": "Jharkhand", "Country": "India"}]}
        },
        "781001": {
            "pincode": "781001",
            "city": "Guwahati",
            "district": "Kamrup",
            "state": "Assam",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Kamrup", "State": "Assam", "Country": "India"}]}
        },
        "171001": {
            "pincode": "171001",
            "city": "Shimla",
            "district": "Shimla",
            "state": "Himachal Pradesh",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Shimla", "State": "Himachal Pradesh", "Country": "India"}]}
        },
        "249407": {
            "pincode": "249407",
            "city": "Haridwar",
            "district": "Haridwar",
            "state": "Uttarakhand",
            "country": "India",
            "raw_response": {"Status": "Success", "PostOffice": [{"District": "Haridwar", "State": "Uttarakhand", "Country": "India"}]}
        },
    }
    
    if pincode in fallback_data:
        print(f"Using fallback data for pincode: {pincode}")
        return fallback_data[pincode]
    
    return None


def get_cached_or_fetch_pincode(pincode):
    pincode = str(pincode)
    try:
        pincode_location = PincodeLocation.objects.get(pincode=pincode)
        if pincode_location.updated_at >= timezone.now() - timedelta(days=7):
            return pincode_location
    except PincodeLocation.DoesNotExist:
        pass
    
    details = get_pincode_details(pincode)
    if details:
        pincode_location, created = PincodeLocation.objects.update_or_create(
            pincode=pincode,
            defaults={
                "city": details["city"],
                "district": details["district"],
                "state": details["state"],
                "country": details["country"],
                "raw_response": details["raw_response"]
            }
        )
        return pincode_location
    return None


def calculate_distance_km(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    R = 6371
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def geocode_pincode(pincode_location):
    city_coordinates = {
        "New Delhi": (28.6139, 77.2090),
        "Delhi": (28.7041, 77.1025),
        "Central Delhi": (28.6139, 77.2090),
        "Mumbai": (19.0760, 72.8777),
        "Bengaluru": (12.9716, 77.5946),
        "Bengaluru Urban": (12.9716, 77.5946),
        "Chennai": (13.0827, 80.2707),
        "Kolkata": (22.5726, 88.3639),
        "Hyderabad": (17.3850, 78.4867),
        "Pune": (18.5204, 73.8567),
        "Ahmedabad": (23.0225, 72.5714),
        "Jaipur": (26.9124, 75.7873),
        "Patna": (25.5941, 85.1376),
        "Bihar Sharif": (25.1982, 85.5229),
        "Nalanda": (25.1355, 85.4434),
        "Gaya": (24.7955, 85.0002),
        "Bhagalpur": (25.2425, 87.0169),
        "Muzaffarpur": (26.1209, 85.3647),
        "Darbhanga": (26.1542, 85.8918),
        "Purnia": (25.7771, 87.4753),
        "Arrah": (25.5560, 84.6635),
        "Begusarai": (25.4182, 86.1272),
        "Katihar": (25.5399, 87.5718),
        "Munger": (25.3748, 86.4735),
        "Chhapra": (25.7815, 84.7479),
        "Danapur": (25.6368, 85.0458),
        "Sasaram": (24.9490, 84.0310),
        "Dehri": (24.9059, 84.1829),
        "Hajipur": (25.6854, 85.2140),
        "Lucknow": (26.8467, 80.9462),
        "Bhopal": (23.2599, 77.4126),
        "Chandigarh": (30.7333, 76.7794),
        "Bhubaneswar": (20.2961, 85.8245),
        "Khordha": (20.2961, 85.8245),
        "Dehradun": (30.3165, 78.0322),
        "Ranchi": (23.3441, 85.3096),
        "Guwahati": (26.1445, 91.7362),
        "Kamrup": (26.1445, 91.7362),
        "Shimla": (31.1048, 77.1734),
        "Haridwar": (29.9457, 78.1642),
    }
    city = pincode_location.city or pincode_location.district or pincode_location.state
    if city in city_coordinates:
        return city_coordinates[city]
    return (28.6139, 77.2090)


def get_serviceability(pincode):
    try:
        pincode = str(pincode)
        pincode_location = get_cached_or_fetch_pincode(pincode)
        if not pincode_location:
            return {
                "success": False,
                "pincode": pincode,
                "serviceable": False,
                "message": "Invalid pincode or delivery area not found."
            }
        
        lat, lon = geocode_pincode(pincode_location)
        if lat and lon:
            pincode_location.latitude = lat
            pincode_location.longitude = lon
            pincode_location.save(update_fields=["latitude", "longitude"])
        
        active_areas = DeliveryServiceArea.objects.filter(active=True)
        matched_area = None
        min_distance = None
        
        for area in active_areas:
            distance = calculate_distance_km(lat, lon, area.center_latitude, area.center_longitude)
            if distance is not None and distance <= float(area.radius_km):
                if min_distance is None or distance < min_distance:
                    min_distance = distance
                    matched_area = area
        
        pincode_location.is_serviceable = matched_area is not None
        pincode_location.save(update_fields=["is_serviceable", "updated_at"])
        
        if matched_area:
            today = timezone.localdate()
            delivery_start = today + timedelta(days=matched_area.delivery_days_min)
            delivery_end = today + timedelta(days=matched_area.delivery_days_max)
            
            return {
                "success": True,
                "pincode": pincode,
                "serviceable": True,
                "city": pincode_location.city,
                "district": pincode_location.district,
                "state": pincode_location.state,
                "country": pincode_location.country,
                "delivery_days_min": matched_area.delivery_days_min,
                "delivery_days_max": matched_area.delivery_days_max,
                "delivery_start": delivery_start.isoformat(),
                "delivery_end": delivery_end.isoformat(),
                "distance_km": round(min_distance, 2),
                "service_area": matched_area.name,
                "message": "Delivery available at this pincode."
            }
        
        return {
            "success": True,
            "pincode": pincode,
            "serviceable": False,
            "city": pincode_location.city,
            "district": pincode_location.district,
            "state": pincode_location.state,
            "country": pincode_location.country,
            "message": "Delivery not available at this pincode."
        }
    except Exception as e:
        print(f"Error in get_serviceability: {e}")
        return {
            "success": False,
            "pincode": str(pincode),
            "serviceable": False,
            "message": f"Error checking serviceability: {str(e)}"
        }


def validate_coupon(coupon_code, pincode, subtotal, user=None):
    try:
        coupon = Coupon.objects.get(code__iexact=coupon_code, active=True)
    except Coupon.DoesNotExist:
        return {"valid": False, "code": coupon_code, "discount_amount": 0, "message": "Invalid coupon code."}
    
    now = timezone.now()
    if now < coupon.valid_from:
        return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not yet active."}
    if now > coupon.valid_until:
        return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon has expired."}
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon has reached its usage limit."}
    if user and user.is_authenticated:
        user_usage_count = CouponUsage.objects.filter(coupon=coupon, user=user).count()
        if user_usage_count >= coupon.per_user_limit:
            return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "You have already used this coupon."}
    if subtotal < coupon.minimum_order_amount:
        return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": f"Minimum order amount of ₹{coupon.minimum_order_amount} required."}
    
    serviceability = get_serviceability(pincode)
    if not serviceability.get("serviceable", False):
        return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not valid for your delivery location."}
    
    if coupon.applicable_country and serviceability.get("country"):
        if coupon.applicable_country.lower() != serviceability["country"].lower():
            return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not valid for your delivery location."}
    if coupon.applicable_state and serviceability.get("state"):
        if coupon.applicable_state.lower() != serviceability["state"].lower():
            return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not valid for your delivery location."}
    if coupon.applicable_city and serviceability.get("city"):
        if coupon.applicable_city.lower() != serviceability["city"].lower():
            return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not valid for your delivery location."}
    if coupon.applicable_pincode and serviceability.get("pincode"):
        if coupon.applicable_pincode != serviceability["pincode"]:
            return {"valid": False, "code": coupon.code, "discount_amount": 0, "message": "This coupon is not valid for your delivery location."}
    
    if coupon.discount_type == "percentage":
        discount = subtotal * coupon.discount_value / 100
        if coupon.maximum_discount and discount > coupon.maximum_discount:
            discount = coupon.maximum_discount
    else:
        discount = coupon.discount_value
    
    if discount > subtotal:
        discount = subtotal
    
    return {"valid": True, "code": coupon.code, "discount_type": coupon.discount_type, "discount_value": coupon.discount_value, "discount_amount": discount, "message": "Coupon applied successfully."}


def get_available_coupons(pincode, subtotal, user=None):
    try:
        serviceability = get_serviceability(pincode)
        if not serviceability.get("serviceable", False):
            return {"serviceable": False, "coupons": [], "message": "Delivery not available at this pincode."}
        
        now = timezone.now()
        available_coupons = []
        coupons = Coupon.objects.filter(active=True, valid_from__lte=now, valid_until__gte=now)
        
        for coupon in coupons:
            if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                continue
            if subtotal < coupon.minimum_order_amount:
                continue
            if coupon.applicable_state and serviceability.get("state"):
                if coupon.applicable_state.lower() != serviceability["state"].lower():
                    continue
            if coupon.applicable_city and serviceability.get("city"):
                if coupon.applicable_city.lower() != serviceability["city"].lower():
                    continue
            if coupon.applicable_pincode and serviceability.get("pincode"):
                if coupon.applicable_pincode != serviceability["pincode"]:
                    continue
            
            available_coupons.append({
                "code": coupon.code,
                "description": coupon.description,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value,
                "minimum_order_amount": coupon.minimum_order_amount,
                "maximum_discount": coupon.maximum_discount,
            })
        
        return {"serviceable": True, "coupons": available_coupons, "serviceability": serviceability}
    except Exception as e:
        print(f"Error in get_available_coupons: {e}")
        return {"serviceable": False, "coupons": [], "message": f"Error: {str(e)}"}


class PincodeServiceabilityView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        pincode = request.query_params.get("pincode", "")
        if not pincode:
            return Response({"success": False, "message": "Pincode is required."}, status=400)
        result = get_serviceability(pincode)
        return Response(result)


class AvailableCouponsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        pincode = request.query_params.get("pincode", "")
        subtotal = Decimal(request.query_params.get("subtotal", "0"))
        result = get_available_coupons(pincode, subtotal, request.user)
        return Response(result)


class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        code = request.data.get("code", "")
        pincode = request.data.get("pincode", "")
        subtotal = Decimal(request.data.get("subtotal", "0"))
        result = validate_coupon(code, pincode, subtotal, request.user)
        return Response(result)


class OrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request): return Response(OrderSerializer(Order.objects.filter(user=request.user).prefetch_related("items").order_by("-created_at"), many=True).data)
    
    @transaction.atomic
    def post(self, request):
        address_serializer = AddressSerializer(data=request.data.get("address", {})); address_serializer.is_valid(raise_exception=True)
        cart = Cart.objects.select_for_update().filter(user=request.user).first()
        if not cart or not cart.items.exists(): return Response({"detail": "Your cart is empty."}, status=400)
        address = address_serializer.save(user=request.user)
        items = list(cart.items.select_related("product").select_for_update())
        subtotal = sum((item.product.price * item.quantity for item in items), Decimal("0"))
        for item in items:
            if not item.product.is_available or item.quantity > item.product.stock: return Response({"detail": f"{item.product.name} is unavailable."}, status=400)
        
        serviceability = get_serviceability(address.pincode)
        if not serviceability.get("serviceable", False):
            return Response({"detail": "Delivery not available at this pincode."}, status=400)
        
        location_discount = calculate_location_discount(address, subtotal)
        
        coupon_discount = Decimal("0")
        coupon_code = request.data.get("coupon_code", "")
        if coupon_code:
            coupon_result = validate_coupon(coupon_code, address.pincode, subtotal, request.user)
            if not coupon_result.get("valid", False):
                return Response({"detail": coupon_result.get("message", "Invalid coupon.")}, status=400)
            coupon_discount = coupon_result["discount_amount"]
            coupon_code = coupon_result["code"]
        
        total_discount = location_discount + coupon_discount
        shipping = Decimal("0") if subtotal >= 5000 else Decimal("199")
        tax = (subtotal - total_discount + shipping) * Decimal("0.03")
        today = timezone.localdate()
        
        order = Order.objects.create(
            user=request.user, 
            shipping_address=address, 
            subtotal=subtotal, 
            discount=location_discount,
            coupon_code=coupon_code if coupon_code else None,
            coupon_discount=coupon_discount,
            shipping=shipping, 
            tax=tax, 
            total=subtotal-total_discount+shipping+tax, 
            serviceability_checked=True,
            delivery_days_min=serviceability.get("delivery_days_min", 3),
            delivery_days_max=serviceability.get("delivery_days_max", 6),
            estimated_delivery_start=serviceability.get("delivery_start", today + timedelta(days=3)), 
            estimated_delivery_end=serviceability.get("delivery_end", today + timedelta(days=6))
        )
        
        for item in items:
            product = item.product; product.stock -= item.quantity; product.save(update_fields=["stock"])
            OrderItem.objects.create(order=order, product=product, product_name=product.name, quantity=item.quantity, price_at_purchase=product.price, discount_at_purchase=Decimal("0"), subtotal=product.price * item.quantity)
        
        if coupon_code:
            coupon = Coupon.objects.get(code=coupon_code)
            coupon.used_count += 1
            coupon.save(update_fields=["used_count"])
            CouponUsage.objects.create(coupon=coupon, user=request.user, order=order)
        
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return Order.objects.filter(user=self.request.user).prefetch_related("items")


class ReviewCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        product_id = request.data.get("product_id")
        if not OrderItem.objects.filter(order__user=request.user, product_id=product_id, order__status="delivered").exists(): return Response({"detail": "Only customers with delivered purchases may review."}, status=403)
        serializer = ReviewSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        review, created = Review.objects.update_or_create(user=request.user, product_id=product_id, defaults=serializer.validated_data)
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# WISHLIST COLLECTION VIEWS
class WishlistCollectionListCreateView(APIView):
    """List all collections for the authenticated user or create a new collection"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        collections = WishlistCollection.objects.filter(user=request.user).prefetch_related("items__product")
        serializer = WishlistCollectionSerializer(collections, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = WishlistCollectionSerializer(data=request.data)
        if serializer.is_valid():
            # Create collection for authenticated user
            collection = serializer.save(user=request.user)
            return Response(WishlistCollectionSerializer(collection).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WishlistCollectionDetailView(APIView):
    """Retrieve, update, or delete a specific collection (owner only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_collection(self, pk, user):
        """Get collection, ensuring user is the owner"""
        try:
            collection = WishlistCollection.objects.get(pk=pk, user=user)
            return collection, None
        except WishlistCollection.DoesNotExist:
            return None, Response({"detail": "Collection not found."}, status=status.HTTP_404_NOT_FOUND)
    
    def get(self, request, pk):
        collection, error = self.get_collection(pk, request.user)
        if error:
            return error
        serializer = WishlistCollectionDetailSerializer(collection)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        collection, error = self.get_collection(pk, request.user)
        if error:
            return error
        serializer = WishlistCollectionDetailSerializer(collection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(WishlistCollectionDetailSerializer(collection).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        collection, error = self.get_collection(pk, request.user)
        if error:
            return error
        collection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistCollectionItemAddView(APIView):
    """Add a product to a collection"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            collection = WishlistCollection.objects.get(pk=pk, user=request.user)
        except WishlistCollection.DoesNotExist:
            return Response({"detail": "Collection not found."}, status=status.HTTP_404_NOT_FOUND)
        
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if product already in collection
        if collection.items.filter(product_id=product_id).exists():
            return Response({"detail": "Product already in collection."}, status=status.HTTP_400_BAD_REQUEST)
        
        item = WishlistCollectionItem.objects.create(collection=collection, product=product)
        serializer = WishlistCollectionItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistCollectionItemRemoveView(APIView):
    """Remove a product from a collection"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, pk, product_id):
        try:
            collection = WishlistCollection.objects.get(pk=pk, user=request.user)
        except WishlistCollection.DoesNotExist:
            return Response({"detail": "Collection not found."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            item = WishlistCollectionItem.objects.get(collection=collection, product_id=product_id)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WishlistCollectionItem.DoesNotExist:
            return Response({"detail": "Item not found in collection."}, status=status.HTTP_404_NOT_FOUND)


class SharedCollectionView(APIView):
    """View a shared collection using share token"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            collection = WishlistCollection.objects.get(share_token=token, visibility="shared")
        except WishlistCollection.DoesNotExist:
            return Response({"detail": "Shared collection not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = WishlistCollectionPublicSerializer(collection)
        return Response(serializer.data)


class PublicCollectionView(APIView):
    """View a public collection"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, pk):
        try:
            collection = WishlistCollection.objects.get(pk=pk, visibility="public")
        except WishlistCollection.DoesNotExist:
            return Response({"detail": "Public collection not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = WishlistCollectionPublicSerializer(collection)
        return Response(serializer.data)

class WishlistCollectionUnlockView(APIView):
    """Verify password for private collections"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        password = request.data.get("password", "")
        
        if not password:
            return Response({"detail": "Password is required."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if any private collection matches this password
        private_collections = WishlistCollection.objects.filter(
            user=request.user,
            visibility="private"
        )
        
        for collection in private_collections:
            if collection.check_password(password):
                return Response({
                    "valid": True,
                    "message": "Private collections unlocked."
                })
        
        return Response({
            "valid": False,
            "detail": "Invalid password."
        }, status=status.HTTP_400_BAD_REQUEST)


# SUPPORT TICKETS (customer-facing)

class SupportTicketListCreateView(APIView):
    """List the authenticated user's own tickets, or create a new one."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tickets = SupportTicket.objects.filter(user=request.user).select_related("order").prefetch_related("messages")
        p = request.query_params
        if p.get("status"):
            tickets = tickets.filter(status=p["status"])
        if p.get("priority"):
            tickets = tickets.filter(priority=p["priority"])
        return Response(SupportTicketListSerializer(tickets, many=True).data)

    def post(self, request):
        serializer = CreateSupportTicketSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        return Response(SupportTicketDetailSerializer(ticket).data, status=status.HTTP_201_CREATED)


class SupportTicketDetailView(APIView):
    """Retrieve a single ticket — owner only. Looked up by the human-readable
    ticket_id (e.g. SUP-XXXXXXXX) rather than the numeric pk, since that's
    what the customer actually sees and what the URL is meant to carry."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.select_related("order").prefetch_related("messages__sender").get(ticket_id=ticket_id, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(SupportTicketDetailSerializer(ticket).data)


class SupportMessageCreateView(APIView):
    """Send a follow-up message on one of the customer's own tickets. Closed
    tickets are read-only; a reply while awaiting_customer moves the ticket
    back to in_progress so it reappears in the admin's active queue."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.get(ticket_id=ticket_id, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status == "closed":
            return Response({"detail": "This ticket is closed and no longer accepts messages."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SupportMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = SupportMessage.objects.create(ticket=ticket, sender=request.user, message=serializer.validated_data["message"])

        if ticket.status == "awaiting_customer":
            ticket.status = "in_progress"
            ticket.save(update_fields=["status", "updated_at"])

        return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class SupportTicketCloseView(APIView):
    """Customer closes their own ticket. Does not delete anything — just
    flips status and stamps closed_at, exactly like Order never deletes,
    only moves through its STATUS_CHOICES."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.get(ticket_id=ticket_id, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status == "closed":
            return Response({"detail": "Ticket is already closed."}, status=status.HTTP_400_BAD_REQUEST)

        ticket.status = "closed"
        ticket.closed_at = timezone.now()
        ticket.save(update_fields=["status", "closed_at", "updated_at"])
        return Response(SupportTicketDetailSerializer(ticket).data)


# SUPPORT TICKETS (admin-facing — staff only)

class AdminSupportTicketListView(APIView):
    """List every customer's tickets, with search + status/priority filters.
    Gated by IsAdminUser (request.user.is_staff) — the same flag that
    already controls access to Django Admin, so no new admin/role model is
    introduced."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        tickets = SupportTicket.objects.select_related("user", "order").prefetch_related("messages")
        p = request.query_params
        if p.get("status"):
            tickets = tickets.filter(status=p["status"])
        if p.get("priority"):
            tickets = tickets.filter(priority=p["priority"])
        search = p.get("search")
        if search:
            tickets = tickets.filter(
                Q(ticket_id__icontains=search)
                | Q(subject__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )
        return Response(AdminSupportTicketListSerializer(tickets.distinct(), many=True).data)


class AdminSupportTicketDetailView(APIView):
    """View any ticket's full detail, or update its status/priority."""
    permission_classes = [permissions.IsAdminUser]

    def get_ticket(self, ticket_id):
        try:
            return SupportTicket.objects.select_related("user", "order").prefetch_related("messages__sender").get(ticket_id=ticket_id), None
        except SupportTicket.DoesNotExist:
            return None, Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, ticket_id):
        ticket, error = self.get_ticket(ticket_id)
        if error:
            return error
        return Response(AdminSupportTicketDetailSerializer(ticket).data)

    def patch(self, request, ticket_id):
        ticket, error = self.get_ticket(ticket_id)
        if error:
            return error
        serializer = AdminUpdateSupportTicketSerializer(ticket, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminSupportTicketDetailSerializer(ticket).data)


class AdminSupportMessageCreateView(APIView):
    """Admin reply to any customer's ticket. A reply nudges an open/awaiting
    ticket into in_progress, mirroring the customer-side auto-transition."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.get(ticket_id=ticket_id)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SupportMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = SupportMessage.objects.create(ticket=ticket, sender=request.user, message=serializer.validated_data["message"])

        if ticket.status in ("open", "awaiting_customer"):
            ticket.status = "in_progress"
            ticket.save(update_fields=["status", "updated_at"])

        return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)        