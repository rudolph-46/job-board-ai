ALTER TABLE "job_listing_applications" ALTER COLUMN "jobListingId" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "descriptionHtml" text;