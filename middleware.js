import {
  auth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/reservations(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Add any custom logic here, e.g. logging, authentication, etc.
  // You can also modify the request or response objects if needed.

  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    // Redirect to sign-in page if user is not authenticated
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
