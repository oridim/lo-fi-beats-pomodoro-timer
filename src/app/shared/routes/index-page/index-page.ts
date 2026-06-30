import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { LucideListChecks, LucidePlay } from "@lucide/angular";

import { TasksService } from "../../services/tasks-service";

import { ActionButton } from "../../components/action-button/action-button";
import { ControlGroup } from "../../components/control-group/control-group";
import { InputGroup } from "../../components/input-group/input-group";
import { PageContainer } from "../../components/page-container/page-container";
import { PageHeader } from "../../components/page-header/page-header";
import { PageTitle } from "../../components/page-title/page-title";
import { TextInput } from "../../components/text-input/text-input";

@Component({
  selector: "index-page",
  imports: [
    LucideListChecks,
    LucidePlay,
    ActionButton,
    ControlGroup,
    InputGroup,
    PageContainer,
    PageHeader,
    PageTitle,
    TextInput,
  ],
  templateUrl: "./index-page.html",
  styleUrl: "./index-page.css",
})
export class IndexPage {
  taskTitle: string = "";

  constructor(
    private readonly router: Router,
    private readonly tasksService: TasksService,
  ) {}

  async onStartTimerClick(_event: MouseEvent): Promise<void> {
    const { router, tasksService, taskTitle } = this;

    if (!taskTitle) {
      return;
    }

    const { uuid } = tasksService.pushTask(taskTitle);
    await router.navigate(["task", uuid]);
  }
}
