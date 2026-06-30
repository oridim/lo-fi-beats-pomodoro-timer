export interface Task {
  readonly createdAt: number;

  readonly isCompleted: boolean;

  readonly uuid: string;

  readonly title: string;
}
