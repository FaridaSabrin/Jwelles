from django.contrib import admin

from .models import (Address, Cart, CartItem, Category, Coupon, CouponUsage,
                    CustomizationRequest, DeliveryServiceArea, LocationDiscount,
                    Order, OrderItem, PincodeLocation, Product, ProductImage,
                    Review, SupportMessage, SupportTicket, WishlistItem,
                    WishlistCollection, WishlistCollectionItem)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "kind", "is_active")
    list_filter = ("kind", "is_active")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "stock", "is_available", "is_featured")
    list_filter = ("is_available", "is_featured", "is_best_seller")
    search_fields = ("name", "category")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "position")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity")


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("full_name", "city", "state", "pincode")
    search_fields = ("full_name", "city", "pincode")


@admin.register(LocationDiscount)
class LocationDiscountAdmin(admin.ModelAdmin):
    list_display = ("country", "state", "city", "pincode", "discount_percentage", "active")
    list_filter = ("active",)


@admin.register(CustomizationRequest)
class CustomizationRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "phone", "user__email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DeliveryServiceArea)
class DeliveryServiceAreaAdmin(admin.ModelAdmin):
    list_display = ("name", "radius_km", "delivery_days_min", "delivery_days_max", "active")
    list_filter = ("active",)


@admin.register(PincodeLocation)
class PincodeLocationAdmin(admin.ModelAdmin):
    list_display = ("pincode", "city", "state", "is_serviceable")
    search_fields = ("pincode", "city", "state")
    list_filter = ("is_serviceable",)


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "minimum_order_amount", "active", "valid_from", "valid_until", "used_count")
    list_filter = ("discount_type", "active")
    search_fields = ("code", "description")


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ("coupon", "user", "used_at")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_id", "user", "status", "total", "payment_status", "created_at")
    list_filter = ("status", "payment_status")
    search_fields = ("order_id", "user__email")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "quantity", "subtotal")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "rating", "created_at")
    list_filter = ("rating",)


@admin.register(WishlistCollection)
class WishlistCollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "visibility", "created_at")
    list_filter = ("visibility", "created_at")
    search_fields = ("name", "user__email")
    readonly_fields = ("share_token", "created_at", "updated_at")


@admin.register(WishlistCollectionItem)
class WishlistCollectionItemAdmin(admin.ModelAdmin):
    list_display = ("collection", "product", "added_at")
    search_fields = ("collection__name", "product__name")
    readonly_fields = ("added_at",)


class SupportMessageInline(admin.TabularInline):
    """Lets an admin read (and add) messages directly on the ticket page,
    so the whole conversation is visible without leaving the admin site."""
    model = SupportMessage
    extra = 1
    fields = ("sender", "message", "created_at")
    readonly_fields = ("created_at",)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ("ticket_id", "user", "category", "priority", "status", "created_at")
    list_filter = ("status", "priority", "category")
    search_fields = ("ticket_id", "subject", "user__username", "user__email")
    readonly_fields = ("ticket_id", "created_at", "updated_at")
    inlines = [SupportMessageInline]


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ("ticket", "sender", "created_at")
    search_fields = ("ticket__ticket_id", "sender__username", "sender__email")
    readonly_fields = ("created_at", "updated_at")