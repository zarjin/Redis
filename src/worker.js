import { connection } from "./queue.js";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log(job);
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log("Job Completed!", job.id, job.name, job.data);
});

emailWorker.on("failed", (job, err) => {
  console.log("Job Failed!", job.id, job.name, job.data, err);
});
