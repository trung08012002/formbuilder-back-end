-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "logo_url" TEXT,
    "image_preview_url" TEXT,
    "settings" JSONB NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "use_total" INTEGER NOT NULL DEFAULT 0,
    "elements" JSONB[],
    "permissions" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "creator_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "category_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
