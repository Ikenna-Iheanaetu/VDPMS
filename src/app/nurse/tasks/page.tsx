import NurseTaskManager from "@/components/nurse/nurse-task-manager";


export default function NurseTasksPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Task Management</h1>
      <NurseTaskManager />
    </div>
  )
}

