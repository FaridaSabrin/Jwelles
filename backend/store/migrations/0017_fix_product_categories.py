"""
Data migration: correct legacy Product.category values that were
mistakenly populated with metal / stone names (Gold, Diamond, Silver)
instead of the canonical jewellery-form slug (rings, necklaces, ...).

This migration ONLY touches the `category` field. It does NOT modify
metal_type, material, stone_type, price, stock, images, tags, or any
other field.

The mapping is intentionally explicit (name -> slug). Any product whose
name is not in the map is left untouched, so running this migration is
safe even on a database that contains a mix of correct and incorrect
rows.
"""
from django.db import migrations


# Explicit name -> correct category slug mapping for the verified bad
# records. Add more entries here if you discover additional affected
# products, then re-run `python manage.py migrate store`.
CORRECTIONS = {
    "Necklace": "necklaces",
    "earings": "earrings",
    "Diamond Ring": "rings",
    "Ring": "rings",
    "Kids Bracelet": "bracelets",
    "Kids Unicorn Pendant Necklace": "necklaces",
    "Anklet": "anklets",
}


def fix_categories(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for name, correct_category in CORRECTIONS.items():
        Product.objects.filter(name=name).update(category=correct_category)


def reverse_fix(apps, schema_editor):
    # No-op: we cannot safely reconstruct the original (incorrect)
    # per-row values. Reversing this migration should not corrupt data.
    pass


class Migration(migrations.Migration):

    dependencies = [
        # IMPORTANT: replace with the actual latest migration in your app.
        ("store", "0016_product_pricing"),
    ]

    operations = [
        migrations.RunPython(fix_categories, reverse_fix),
    ]