<br />
<div align="center">

  <h3 align="center">Health Check Application</h3>

  <p align="center">
    Create an serverless health check service using QStash and Upstash Redis
  </p>
</div>

[Demo](https://healthcheck.upstash.app)
![](/public/preview.png)

Welcome! This example showcases a uptime monitoring system to observe the stability of your API endpoints and web applications. It uses QStash for task scheduling, Upstash Redis as state store and Next.js, combined with beautiful ShadnUI.

# Project Details

The goal of this project is to create a serverless uptime status platform without any long running server. To achieve this, we deploy Vercel Edge functions with Next.js, and schedule a job to this endpoints with QStash. Within this function, we perform the ping operation and write the results to Upstash Redis using the proper data structures. On visit, we retrieve the data from Redis and render the page with Server Side Rendering.

## Stack

- App logic: [Next.js](https://nextjs.org)
- Job scheduling: [QStash](https://upstash.com/docs/qstash)
- State store and database: [Upstash Redis](https://upstash.com/docs/redis)
- UI Library: [ShadcnUI](https://ui.shadcn.com/)

# Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fhealthcheck-example&env=QSTASH_CURRENT_SIGNING_KEY,QSTASH_NEXT_SIGNING_KEY,NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,QSTASH_REST_TOKEN,APP_URL)

You can deploy the project using the **Deploy with Vercel** button located above. After logging in to vercel, you can start the configuration of the project by filling in the credentials. This is rather a simple process, and you'll have your own deployment under several minutes.

![Vercel Credentials](/public/vercel-credentials.png)

Alternatively, you can fork this repository and deploy it to any other platform of choice.

To gather the credentials, please follow:

1. **Redis Secrets**
   Navigate to [Upstash Console](console.upstash.com), and create a database. Then, copy the `UPSTASH_REDIS_NEXT_URL` and `UPSTASH_REDIS_NEXT_TOKEN` variables to necessary fields in `.env.local` file.

   ![Redis Credentials](/public/redis-credentials.png)

2. **QStash Secrets**
   Again in the [Upstash Console](console.upstash.com), navigate to QStash section. And copy the necessary fields.

   ![QStash Credentials](/public/qstash-credentials.png)

3. **App URL**
   Finally, please fill in the URL of choice for your project. After the defining this credential, please configure your project to this domain, or vice versa.

If you have any questions related to the process, please visit [Upstash Documentation](upstash.com/docs), or get in touch via [mail](mailto:support@upstash.com)

### Learn More

To learn more about Upstash and its services, check out the following resources:

- [Documentation](https://docs.upstash.com)
- [Website](https://upstash.com)
- [Blog](https://upstash.com/blog)
- [Console](https://console.upstash.com)
- [Discord](https://upstash.com/discord)
