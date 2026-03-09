export interface ReminderTask {
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: number;
}

export interface ReminderPost {
  content: string;
  scheduledAt: string;
  pillar: string | null;
}

export interface ReminderCamp {
  name: string;
  school: string | null;
  date: string | null;
  registrationStatus: string;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildTaskReminderMessage(input: {
  tasks: ReminderTask[];
  posts: ReminderPost[];
  camps: ReminderCamp[];
  appUrl?: string;
}): string {
  const lines = ["Jake Recruiting OS"];

  if (input.tasks.length > 0) {
    lines.push("Tasks:");
    for (const task of input.tasks.slice(0, 4)) {
      lines.push(
        `${task.priority}. ${truncate(task.title, 60)} (${task.status.replace("_", " ")})`
      );
    }
  } else {
    lines.push("Tasks: none open");
  }

  if (input.posts.length > 0) {
    lines.push("Posts:");
    for (const post of input.posts.slice(0, 2)) {
      const when = new Date(post.scheduledAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      const pillar = post.pillar ? ` ${post.pillar}` : "";
      lines.push(`${when}${pillar}: ${truncate(post.content, 55)}`);
    }
  }

  if (input.camps.length > 0) {
    lines.push("Camps:");
    for (const camp of input.camps.slice(0, 2)) {
      const when = camp.date
        ? new Date(camp.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "TBD";
      lines.push(
        `${when}: ${truncate(camp.name, 32)}${camp.school ? ` (${camp.school})` : ""} [${camp.registrationStatus}]`
      );
    }
  }

  if (input.appUrl) {
    lines.push(`Open: ${input.appUrl.replace(/\/$/, "")}/calendar`);
  }

  return lines.join("\n").slice(0, 1200);
}
