import { Routes } from "@angular/router";

import { taskResolver } from "./shared/resolvers/task-resolver";
import { trackListResolver } from "./shared/resolvers/track-list-resolver";
import { TasksService } from "./shared/services/tasks-service";

import { CompletedPage } from "./shared/routes/completed-page/completed-page";
import { IndexPage } from "./shared/routes/index-page/index-page";
import { TaskPage } from "./shared/routes/task-page/task-page";

export const routes: Routes = [
  {
    path: "",
    component: IndexPage,
    providers: [TasksService],
  },

  {
    path: "completed",
    component: CompletedPage,
    providers: [TasksService],
  },

  {
    path: "task/:uuid",
    component: TaskPage,
    providers: [TasksService],
    resolve: {
      task: taskResolver,
      tracks: trackListResolver,
    },
  },
];
