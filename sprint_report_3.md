# Sprint 3 Report (04/04/2026 - 05/02/2026)

## What's New (User Facing)
 * Overhaul of frontend styling 
 * Bug fixing on scaling to screen size
 * Subscriptions save to user account
 * Improved card information input screen
 * Implementation of the calendar interface


## Work Summary (Developer Facing)
 The improvement in the card input screen comes from the addition of React-Stripe components, which are responsible for then sending the information to Stripe, our payment provider. 
 Subscriptions now save to user accounts through the implementation of a Subscription table in the backend, which store the specific info for a user. 
 Optimization on "useX" by using react query.
 Using `react-big-calendar` library, we have implemented an intuitive way to view your trip's schedule.
 By using Docker, we make cross-platform deployment simple.


## Unfinished Work
 * Implementation of push nofitication for when the app is inactive.
 * Automated billing feature.
 * Make suggestions for places that is near the user's destination.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * [Frontend: Payment](https://github.com/WSU-CPTS322-SP26/TravelBook/issues/9)
 * [Frontend: Event-Creation](https://github.com/WSU-CPTS322-SP26/TravelBook/issues/7)

 
 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 * [Backend: Notifications](https://github.com/WSU-CPTS322-SP26/TravelBook/issues/13) <Not enough time>
 

## Code Files for Review

Please review the following code files, which were actively developed during this sprint, for quality:
 * [backend/billing](https://github.com/WSU-CPTS322-SP26/TravelBook/tree/main/backend/billing)
 * [pages/BillingPage.jsx](https://github.com/WSU-CPTS322-SP26/TravelBook/blob/main/frontend/src/pages/BillingPage.jsx)
 * [Dockerfile](https://github.com/WSU-CPTS322-SP26/TravelBook/blob/main/Dockerfile)

## Retrospective Summary
Here's what went well:
  * New styling looks clean
  * Payment on the frontend
 
Here's what we'd like to improve:
   * Scaling isn't perfect, and could use some improvements
   * Location suggestions in the map
   * Automatic payments
   * Push notifications
  
Here are changes we would plan to implement in the next sprint:
   * Improvements in the section above
   * Server for deployment

[Demo youtube video](https://youtu.be/FqHiOV1DB-8)
