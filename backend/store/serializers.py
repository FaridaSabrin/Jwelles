from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import (Address, CartItem, Category, Coupon, CustomizationRequest,
                    DeliveryServiceArea, EmailVerificationOTP, Order, OrderItem, PincodeLocation,
                    Product, ProductImage, Review, SupportMessage, SupportTicket,
                    WishlistItem, WishlistCollection, WishlistCollectionItem)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "name", "email")
    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "position")


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "original_price", "discount_percentage", "image", "images", "stock", "category", "metal_type", "purity", "weight", "gender", "material", "stone_type", "sizes", "is_available", "is_featured", "is_best_seller", "average_rating", "review_count", "created_at", "updated_at")
    def get_average_rating(self, obj): return round(getattr(obj, "average_rating", 0) or 0, 1)
    def get_review_count(self, obj): return getattr(obj, "review_count", 0) or 0


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "kind", "image")


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.all(), write_only=True)
    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity")


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.all(), write_only=True)
    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_id", "created_at")
        read_only_fields = ("created_at",)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ("id", "full_name", "email", "phone", "line1", "line2", "city", "state", "pincode", "country")


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "quantity", "price_at_purchase", "discount_at_purchase", "subtotal")
    
    def get_product(self, obj):
        """Return product with its image details for order display."""
        if obj.product:
            return {
                "id": obj.product.id,
                "name": obj.product.name,
                "image": obj.product.image,
                "images": [{"image": img.image, "alt_text": img.alt_text} for img in obj.product.images.all()],
            }
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    class Meta:
        model = Order
        fields = ("id", "order_id", "status", "subtotal", "discount", "coupon_code", "coupon_discount", "shipping", "tax", "total", "serviceability_checked", "delivery_days_min", "delivery_days_max", "estimated_delivery_start", "estimated_delivery_end", "payment_status", "created_at", "shipping_address", "items")


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ("id", "user", "rating", "title", "comment", "created_at")
        read_only_fields = ("id", "user", "created_at")


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    def validate_email(self, value):
        value = value.lower()
        existing = get_user_model().objects.filter(email__iexact=value).first()
        if existing:
            # An unverified account left over from an incomplete registration
            # may be reused (new OTP issued) instead of blocking re-signup.
            # Anything else (verified, or no OTP record at all) is a real
            # duplicate and must be rejected.
            otp_record = getattr(existing, "email_verification_otp", None)
            if not otp_record or otp_record.is_verified:
                raise serializers.ValidationError("An account with this email already exists.")
        return value
    def create(self, data):
        name = data.pop("name").strip()
        first_name, *rest = name.split()
        last_name = " ".join(rest)
        email, password = data["email"], data["password"]

        existing = get_user_model().objects.filter(email__iexact=email).first()
        if existing:
            # Reuse the existing unverified account (validate_email already
            # confirmed this is safe) rather than creating a duplicate user.
            existing.first_name = first_name
            existing.last_name = last_name
            existing.is_active = False
            existing.set_password(password)
            existing.save(update_fields=["first_name", "last_name", "is_active", "password"])
            return existing

        # is_active=False until the OTP is verified — VerifyEmailOTPView
        # flips this back on once the email is confirmed.
        return get_user_model().objects.create_user(
            username=email, email=email, password=password,
            first_name=first_name, last_name=last_name, is_active=False,
        )


class VerifyEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_email(self, value):
        return value.lower()

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")
        
        try:
            user = get_user_model().objects.get(email__iexact=email)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError({"email": "No account found with this email."})
        
        try:
            otp_record = EmailVerificationOTP.objects.get(user=user)
        except EmailVerificationOTP.DoesNotExist:
            raise serializers.ValidationError({"otp": "No OTP found. Please request a new OTP."})
        
        is_valid, message = otp_record.check_otp(otp)
        if not is_valid:
            raise serializers.ValidationError({"otp": message})
        
        data["user"] = user
        data["otp_record"] = otp_record
        return data


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()

    def validate(self, data):
        email = data.get("email")
        
        try:
            user = get_user_model().objects.get(email__iexact=email)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError({"email": "No account found with this email."})
        
        try:
            otp_record = EmailVerificationOTP.objects.get(user=user)
        except EmailVerificationOTP.DoesNotExist:
            raise serializers.ValidationError({"email": "No OTP found. Please register again."})
        
        if otp_record.is_verified:
            raise serializers.ValidationError({"email": "Email is already verified. Please login."})
        
        if not otp_record.can_resend():
            raise serializers.ValidationError({"email": "Please wait 60 seconds before requesting a new OTP."})
        
        data["user"] = user
        data["otp_record"] = otp_record
        return data


class CustomizationRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    product_details = ProductSerializer(source="product", read_only=True)
    
    class Meta:
        model = CustomizationRequest
        fields = ("id", "user", "product", "product_details", "name", "email", "phone", 
                 "description", "reference_image", "budget_min", "budget_max", 
                 "status", "created_at", "updated_at")
        read_only_fields = ("id", "user", "status", "created_at", "updated_at")


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ("id", "code", "description", "discount_type", "discount_value", 
                 "minimum_order_amount", "maximum_discount", "valid_from", "valid_until", "active")
        read_only_fields = ("id",)


class DeliveryServiceAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryServiceArea
        fields = ("id", "name", "center_latitude", "center_longitude", "radius_km", 
                 "active", "delivery_days_min", "delivery_days_max")
        read_only_fields = ("id",)


class PincodeLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PincodeLocation
        fields = ("id", "pincode", "city", "district", "state", "country", 
                 "latitude", "longitude", "is_serviceable")
        read_only_fields = ("id",)


class WishlistCollectionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.all(), write_only=True)
    
    class Meta:
        model = WishlistCollectionItem
        fields = ("id", "product", "product_id", "added_at")
        read_only_fields = ("added_at",)


class WishlistCollectionSerializer(serializers.ModelSerializer):
    items = WishlistCollectionItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    preview_image = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_private = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistCollection
        fields = ("id", "name", "visibility", "share_token", "item_count", "preview_image", "items", "password", "is_private", "created_at", "updated_at")
        read_only_fields = ("id", "share_token", "created_at", "updated_at")
    
    def get_item_count(self, obj):
        return obj.items.count()
    
    def get_preview_image(self, obj):
        first_item = obj.items.select_related("product").first()
        if first_item and first_item.product.image:
            return first_item.product.image
        return None
    
    def get_is_private(self, obj):
        return obj.visibility == "private" and bool(obj.password_hash)
    
    def validate(self, data):
        """Validate that private collections have a password"""
        visibility = data.get("visibility", self.instance.visibility if self.instance else "private")
        password = data.get("password")
        
        if visibility == "private" and password and len(password) < 4:
            raise serializers.ValidationError({"password": "Password must be at least 4 characters long."})
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        collection = WishlistCollection(**validated_data)
        
        if collection.visibility == "private" and password:
            collection.set_password(password)
        
        collection.save()
        return collection
    
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if instance.visibility == "private" and password:
            instance.set_password(password)
        
        instance.save()
        return instance


class WishlistCollectionDetailSerializer(serializers.ModelSerializer):
    """Serializer for viewing collection details (with all items)"""
    items = WishlistCollectionItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_private = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistCollection
        fields = ("id", "name", "visibility", "share_token", "item_count", "items", "password", "is_private", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at", "share_token")
    
    def get_item_count(self, obj):
        return obj.items.count()
    
    def get_is_private(self, obj):
        return obj.visibility == "private" and bool(obj.password_hash)
    
    def validate(self, data):
        visibility = data.get("visibility", self.instance.visibility if self.instance else "private")
        password = data.get("password")
        
        if visibility == "private" and password and len(password) < 4:
            raise serializers.ValidationError({"password": "Password must be at least 4 characters long."})
        
        return data
    
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if instance.visibility == "private" and password:
            instance.set_password(password)
        
        instance.save()
        return instance


class WishlistCollectionPublicSerializer(serializers.ModelSerializer):
    """Serializer for public viewing of collections (limited info)"""
    items = WishlistCollectionItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistCollection
        fields = ("id", "name", "item_count", "owner_name", "items", "created_at")
        read_only_fields = ("id", "created_at")
    
    def get_item_count(self, obj):
        return obj.items.count()
    
    def get_owner_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


# SUPPORT TICKETS

class SupportTicketOrderSerializer(serializers.ModelSerializer):
    """Lightweight order summary embedded in a ticket — avoids pulling in the
    full OrderSerializer (items, shipping address, coupon, etc.) when all a
    ticket needs is "which order is this about"."""
    class Meta:
        model = Order
        fields = ("id", "order_id", "status", "total", "created_at")


class SupportMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    is_admin_reply = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ("id", "sender", "is_admin_reply", "message", "created_at")

    def get_is_admin_reply(self, obj):
        # Sender role is derived from the existing is_staff flag rather than
        # a duplicate stored field — an admin reply is simply a message sent
        # by a staff user.
        return obj.sender.is_staff


class SupportMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField()

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Message cannot be empty.")
        return value


class SupportTicketListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    order = SupportTicketOrderSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = ("id", "ticket_id", "subject", "category", "category_display", "priority", "priority_display",
                 "status", "status_display", "order", "message_count", "created_at", "updated_at")

    def get_message_count(self, obj):
        return obj.messages.count()


class SupportTicketDetailSerializer(SupportTicketListSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)

    class Meta(SupportTicketListSerializer.Meta):
        fields = SupportTicketListSerializer.Meta.fields + ("resolved_at", "closed_at", "messages")


class CreateSupportTicketSerializer(serializers.Serializer):
    """Creates a ticket and its first message (the customer's description)
    in one call — the description becomes SupportMessage #1, so the
    conversation thread and the ticket's "what's the problem" are the same
    piece of data instead of two disconnected fields."""

    category = serializers.ChoiceField(choices=SupportTicket.CATEGORY_CHOICES)
    subject = serializers.CharField(max_length=200)
    description = serializers.CharField()
    priority = serializers.ChoiceField(choices=SupportTicket.PRIORITY_CHOICES, required=False, default="medium")
    order_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value

    def validate_order_id(self, value):
        if value is None:
            return value
        request = self.context["request"]
        # A customer may only attach one of their own orders — never expose
        # or allow linking another customer's order.
        if not Order.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError("Invalid order.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        description = validated_data.pop("description")
        order_id = validated_data.pop("order_id", None)
        order = Order.objects.get(id=order_id) if order_id else None
        ticket = SupportTicket.objects.create(user=request.user, order=order, **validated_data)
        SupportMessage.objects.create(ticket=ticket, sender=request.user, message=description)
        return ticket


class AdminSupportTicketListSerializer(SupportTicketListSerializer):
    user = UserSerializer(read_only=True)

    class Meta(SupportTicketListSerializer.Meta):
        fields = SupportTicketListSerializer.Meta.fields + ("user",)


class AdminSupportTicketDetailSerializer(AdminSupportTicketListSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)

    class Meta(AdminSupportTicketListSerializer.Meta):
        fields = AdminSupportTicketListSerializer.Meta.fields + ("resolved_at", "closed_at", "messages")


class AdminUpdateSupportTicketSerializer(serializers.ModelSerializer):
    """Admin-only status/priority updates. Stamps resolved_at/closed_at the
    first time a ticket enters that status, mirroring how the rest of the
    project timestamps state transitions (e.g. Order never rewrites
    created_at, just adds fields for the moments that matter)."""

    class Meta:
        model = SupportTicket
        fields = ("status", "priority")

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")
        if new_status and new_status != instance.status:
            if new_status == "resolved" and not instance.resolved_at:
                instance.resolved_at = timezone.now()
            if new_status == "closed" and not instance.closed_at:
                instance.closed_at = timezone.now()
        return super().update(instance, validated_data)