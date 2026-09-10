from django.urls import path
from . import views

urlpatterns = [
    path("products/", views.ProductListView.as_view()), 
    path("products/<int:pk>/", views.ProductDetailView.as_view()), 
    path("categories/", views.CategoryListView.as_view()),
    path("auth/register/", views.RegisterView.as_view()), 
<<<<<<< HEAD
    path("auth/verify-email/", views.VerifyEmailOTPView.as_view()),
    path("auth/resend-otp/", views.ResendOTPView.as_view()),
    path("auth/login/", views.LoginView.as_view()), 
    path("auth/logout/", views.LogoutView.as_view()), 
    path("auth/admin/destroy-token/<int:user_id>/", views.AdminDestroyTokenView.as_view()),
=======
    path("auth/login/", views.LoginView.as_view()), 
    path("auth/logout/", views.LogoutView.as_view()), 
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
    path("profile/", views.ProfileView.as_view()),
    path("cart/", views.CartView.as_view()), 
    path("cart/items/", views.CartItemCreateView.as_view()), 
    path("cart/items/<int:pk>/", views.CartItemDetailView.as_view()),
    path("wishlist/", views.WishlistView.as_view()), 
    path("wishlist/<int:pk>/", views.WishlistDetailView.as_view()),
    # Wishlist Collections
    path("wishlist/collections/", views.WishlistCollectionListCreateView.as_view()),
    path("wishlist/collections/unlock/", views.WishlistCollectionUnlockView.as_view()),
    path("wishlist/collections/<int:pk>/", views.WishlistCollectionDetailView.as_view()),
    path("wishlist/collections/<int:pk>/items/", views.WishlistCollectionItemAddView.as_view()),
    path("wishlist/collections/<int:pk>/items/<int:product_id>/", views.WishlistCollectionItemRemoveView.as_view()),
    path("wishlist/shared/<str:token>/", views.SharedCollectionView.as_view()),
    path("wishlist/public/<int:pk>/", views.PublicCollectionView.as_view()),
    # Addresses, Orders, etc.
    path("addresses/", views.AddressListView.as_view()),
    path("addresses/<int:pk>/", views.AddressDetailView.as_view()),
    path("orders/", views.OrderListCreateView.as_view()), 
    path("orders/<int:pk>/", views.OrderDetailView.as_view()), 
    path("reviews/", views.ReviewCreateView.as_view()),
    path("customization/", views.CustomizationRequestView.as_view()),
    path("customization/<int:pk>/", views.CustomizationRequestDetailView.as_view()),
    path("serviceability/pincode/", views.PincodeServiceabilityView.as_view()),
    path("coupons/available/", views.AvailableCouponsView.as_view()),
    path("coupons/validate/", views.ValidateCouponView.as_view()),
    # Support Tickets (customer)
    path("support/tickets/", views.SupportTicketListCreateView.as_view()),
    path("support/tickets/<str:ticket_id>/", views.SupportTicketDetailView.as_view()),
    path("support/tickets/<str:ticket_id>/messages/", views.SupportMessageCreateView.as_view()),
    path("support/tickets/<str:ticket_id>/close/", views.SupportTicketCloseView.as_view()),
    # Support Tickets (admin — staff only)
    path("admin/support/tickets/", views.AdminSupportTicketListView.as_view()),
    path("admin/support/tickets/<str:ticket_id>/", views.AdminSupportTicketDetailView.as_view()),
    path("admin/support/tickets/<str:ticket_id>/messages/", views.AdminSupportMessageCreateView.as_view()),
]