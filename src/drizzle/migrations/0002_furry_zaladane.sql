CREATE TYPE "public"."job_listings_ai_employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."job_listings_ai_work_arrangement" AS ENUM('On-site', 'Remote', 'Hybrid');--> statement-breakpoint
DROP INDEX "job_listings_stateAbbreviation_index";--> statement-breakpoint
ALTER TABLE "job_listings" ALTER COLUMN "status" SET DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "organizationName" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "organizationLogo" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "organizationUrl" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "url" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "region" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "country" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiSalaryMinValue" integer;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiSalaryMaxValue" integer;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiSalaryCurrency" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiExperienceLevel" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiWorkArrangement" "job_listings_ai_work_arrangement";--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiWorkArrangementOfficeDays" integer;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiRemoteLocation" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiKeySkills" jsonb;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiCoreResponsibilities" text;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiRequirementsSummary" text;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiWorkingHours" integer;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiEmploymentType" jsonb;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiJobLanguage" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiVisaSponsorship" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "aiBenefits" text;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgEmployees" integer;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgSize" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgSlogan" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgIndustry" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgFoundedDate" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgHeadquarters" varchar;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgSpecialties" jsonb;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "linkedinOrgDescription" text;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "datePosted" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "job_listings_city_index" ON "job_listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "job_listings_country_index" ON "job_listings" USING btree ("country");--> statement-breakpoint
CREATE INDEX "job_listings_aiWorkArrangement_index" ON "job_listings" USING btree ("aiWorkArrangement");--> statement-breakpoint
CREATE INDEX "job_listings_organizationName_index" ON "job_listings" USING btree ("organizationName");--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "wage";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "wageInterval";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "stateAbbreviation";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "locationRequirement";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "experienceLevel";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "applicationUrl";--> statement-breakpoint
ALTER TABLE "job_listings" DROP COLUMN "postedAt";--> statement-breakpoint
DROP TYPE "public"."job_listings_experience_level";--> statement-breakpoint
DROP TYPE "public"."job_listings_type";--> statement-breakpoint
DROP TYPE "public"."job_listings_location_requirement";--> statement-breakpoint
DROP TYPE "public"."job_listings_wage_interval";