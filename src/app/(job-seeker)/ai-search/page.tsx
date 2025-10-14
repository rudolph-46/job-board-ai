import { AsyncIf } from "@/components/AsyncIf"
import { LoadingSwap } from "@/components/LoadingSwap"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { JobListingAiSearchForm } from "@/features/jobListings/components/JobListingAiSearchForm"
import { SignUpButton } from "@/services/clerk/components/AuthButtons"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"

export default function AiSearchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Job Search</h1>
        <p className="text-muted-foreground">
          Let our AI find the perfect jobs for you based on your preferences
        </p>
      </div>
      
      <div className="flex items-center justify-center">
        <Card className="max-w-4xl w-full">
          <AsyncIf
            condition={async () => {
              const { userId } = await getCurrentUser()
              return userId != null
            }}
            loadingFallback={
              <LoadingSwap isLoading>
                <AiCard />
              </LoadingSwap>
            }
            otherwise={<NoPermission />}
          >
            <AiCard />
          </AsyncIf>
        </Card>
      </div>
    </div>
  )
}

function AiCard() {
  return (
    <>
      <CardHeader>
        <CardTitle>AI Search</CardTitle>
        <CardDescription>
          This can take a few minutes to process, so please be patient.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JobListingAiSearchForm />
      </CardContent>
    </>
  )
}

function NoPermission() {
  return (
    <CardContent className="text-center">
      <h2 className="text-xl font-bold mb-1">Permission Denied</h2>
      <p className="mb-4 text-muted-foreground">
        You need to create an account before using AI search
      </p>
      <SignUpButton />
    </CardContent>
  )
}
