import uuid
import os
import secrets

from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


def generate_order_id():
    return uuid.uuid4().hex[:12].upper()


def generate_ticket_id():
    return f"SUP-{uuid.uuid4().hex[:8].upper()}"


def customization_image_upload_path(instance, filename):
    """Generate upload path for customization reference images."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('customization_images', filename)


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    kind = models.CharField(max_length=20, choices=(("metal", "Metal"), ("jewellery", "Jewellery type")), default="jewellery")
    image = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["kind", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    metal_type = models.CharField(max_length=50, blank=True)
    purity = models.CharField(max_length=50, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, help_text="Weight in grams")
    gender = models.CharField(max_length=20, blank=True, choices=(("women", "Women"), ("men", "Men"), ("kids", "Kids"), ("unisex", "Unisex")))
    material = models.CharField(max_length=100, blank=True)
    stone_type = models.CharField(max_length=100, blank=True)
    sizes = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    image = models.URLField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def discount_percentage(self):
        if self.original_price and self.original_price > self.price:
            return round((self.original_price - self.price) * 100 / self.original_price, 2)
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.URLField()
    alt_text = models.CharField(max_length=200, blank=True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name="shopping_cart", on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "product"], name="unique_cart_product")]


class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="wishlist_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_wishlist_product")]


class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="addresses", on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="India")
    created_at = models.DateTimeField(auto_now_add=True)


class LocationDiscount(models.Model):
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)

    def applies_to(self, address):
        today = timezone.localdate()
        return self.active and self.start_date <= today and (not self.end_date or self.end_date >= today) and all(
            not value or value.lower() == getattr(address, field).lower()
            for field, value in (("country", self.country), ("state", self.state), ("city", self.city), ("pincode", self.pincode))
        )


class CustomizationRequest(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="customization_requests", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="customization_requests", on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    description = models.TextField()
    reference_image = models.ImageField(upload_to=customization_image_upload_path, blank=True, null=True)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.status}"


class DeliveryServiceArea(models.Model):
    name = models.CharField(max_length=150)
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_km = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(1)])
    active = models.BooleanField(default=True)
    delivery_days_min = models.PositiveSmallIntegerField(default=3)
    delivery_days_max = models.PositiveSmallIntegerField(default=6)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.radius_km}km)"


class PincodeLocation(models.Model):
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=150, blank=True)
    district = models.CharField(max_length=150, blank=True)
    state = models.CharField(max_length=150, blank=True)
    country = models.CharField(max_length=100, default="India")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_serviceable = models.BooleanField(default=False)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.pincode} - {self.city}"


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    )
    
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(default=1)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    active = models.BooleanField(default=True)
    first_order_only = models.BooleanField(default=False)
    
    applicable_country = models.CharField(max_length=100, blank=True)
    applicable_state = models.CharField(max_length=100, blank=True)
    applicable_city = models.CharField(max_length=100, blank=True)
    applicable_pincode = models.CharField(max_length=10, blank=True)
    minimum_delivery_radius_km = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    maximum_delivery_radius_km = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} ({self.discount_type})"


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, related_name="usages", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.ForeignKey("Order", on_delete=models.CASCADE, null=True, blank=True)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["coupon", "user", "order"], name="unique_coupon_user_order")]


class Order(models.Model):
    STATUS_CHOICES = (("placed", "Order Placed"), ("confirmed", "Confirmed"), ("processing", "Processing"), ("shipped", "Shipped"), ("out_for_delivery", "Out for Delivery"), ("delivered", "Delivered"), ("cancelled", "Cancelled"))
    order_id = models.CharField(max_length=32, unique=True, editable=False, default=generate_order_id)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.PROTECT)
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="placed")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    coupon_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    serviceability_checked = models.BooleanField(default=False)
    delivery_days_min = models.PositiveSmallIntegerField(default=3)
    delivery_days_max = models.PositiveSmallIntegerField(default=6)
    estimated_delivery_start = models.DateField()
    estimated_delivery_end = models.DateField()
    payment_status = models.CharField(max_length=20, choices=(("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed")), default="pending")
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=12, decimal_places=2)
    discount_at_purchase = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=150, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_product_review")]


class WishlistCollection(models.Model):
    """User-created collections to organize wishlist items"""
    VISIBILITY_CHOICES = (
        ("private", "Private"),
        ("shared", "Shared"),
        ("public", "Public"),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="wishlist_collections", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="private")
    share_token = models.CharField(max_length=64, unique=True, blank=True, null=True, db_index=True)
    password_hash = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="unique_user_collection_name")
        ]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"
    
    def save(self, *args, **kwargs):
        # Generate share token for shared/public collections
        if self.visibility in ["shared", "public"] and not self.share_token:
            self.share_token = secrets.token_urlsafe(48)
        # Clear share token for private collections
        elif self.visibility == "private":
            self.share_token = None
        super().save(*args, **kwargs)
    
    def set_password(self, raw_password):
        """Set password hash for private collections"""
        if raw_password:
            self.password_hash = make_password(raw_password)
        else:
            self.password_hash = None
    
    def check_password(self, raw_password):
        """Check password for private collections"""
        if not self.password_hash:
            return True  # Legacy collections without password
        return check_password(raw_password, self.password_hash)


class WishlistCollectionItem(models.Model):
    """Items in a wishlist collection"""
    collection = models.ForeignKey(WishlistCollection, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-added_at"]
        constraints = [
            models.UniqueConstraint(fields=["collection", "product"], name="unique_collection_product")
        ]

    def __str__(self):
        return f"{self.product.name} in {self.collection.name}"


class SupportTicket(models.Model):
    """Customer support ticket. A ticket belongs to exactly one customer and
    may optionally reference one of that same customer's orders."""

    CATEGORY_CHOICES = (
        ("order_issue", "Order Issue"),
        ("payment_issue", "Payment Issue"),
        ("product_issue", "Product Issue"),
        ("delivery_issue", "Delivery Issue"),
        ("account_issue", "Account Issue"),
        ("custom_jewellery_issue", "Custom Jewellery Issue"),
        ("other", "Other"),
    )

    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )

    STATUS_CHOICES = (
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("awaiting_customer", "Awaiting Customer"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    )

    ticket_id = models.CharField(max_length=20, unique=True, editable=False, default=generate_ticket_id)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="support_tickets", on_delete=models.CASCADE)
    order = models.ForeignKey("Order", related_name="support_tickets", on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"


class SupportMessage(models.Model):
    """A single message in a support ticket's conversation. The sender is
    always a regular User row — whether it reads as a "customer" or "admin"
    message is derived from sender.is_staff (see SupportMessageSerializer),
    so no separate role field is stored here."""

    ticket = models.ForeignKey(SupportTicket, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="support_messages", on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message on {self.ticket.ticket_id} by {self.sender}"