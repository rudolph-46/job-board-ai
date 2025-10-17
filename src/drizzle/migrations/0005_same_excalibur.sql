CREATE TABLE "locations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"country" varchar NOT NULL,
	"city" varchar NOT NULL,
	"job_count" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "locationId" varchar;--> statement-breakpoint
CREATE INDEX "idx_locations_country" ON "locations" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_locations_city" ON "locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_locations_job_count" ON "locations" USING btree ("job_count");--> statement-breakpoint
CREATE INDEX "idx_locations_country_city_unique" ON "locations" USING btree ("country","city");--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_locationId_locations_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_listings_locationId_index" ON "job_listings" USING btree ("locationId");