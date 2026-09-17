from django.db import migrations


TAGS = [
    # Occasions
    ("Wedding", "wedding", "occasion"),
    ("Engagement", "engagement", "occasion"),
    ("Anniversary", "anniversary", "occasion"),
    ("Birthday", "birthday", "occasion"),
    ("Valentine's Day", "valentine", "occasion"),
    ("Diwali Special", "diwali", "occasion"),
    # Styles
    ("Daily Wear", "daily", "style"),
    ("Office Wear", "office", "style"),
    ("Party Wear", "party", "style"),
    ("Traditional", "traditional", "style"),
    ("Modern", "modern", "style"),
    ("Minimalist", "minimalist", "style"),
    # Gift / special
    ("Corporate Gift", "corporate", "gift"),
    ("Limited Edition", "limited", "special"),
]


def seed_tags(apps, schema_editor):
    ProductTag = apps.get_model("store", "ProductTag")
    for name, slug, kind in TAGS:
        ProductTag.objects.get_or_create(
            slug=slug,
            defaults={"name": name, "kind": kind, "is_active": True},
        )


def unseed_tags(apps, schema_editor):
    ProductTag = apps.get_model("store", "ProductTag")
    slugs = [slug for _, slug, _ in TAGS]
    ProductTag.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0012_add_product_tags_and_back_in_stock"),
    ]

    operations = [
        migrations.RunPython(seed_tags, unseed_tags),
    ]