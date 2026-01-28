import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CircleCheck, X } from "lucide-react"

function AlertSuccessWithAction() {
    return (
        <Alert
            layout="row"
            isNotification
            className="min-w-[400px]"
            icon={
                <CircleCheck
                    className="text-emerald-500"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                />
            }
            action={
                <div className="flex items-center gap-3">
                    <Button size="sm">Undo</Button>
                    <Button
                        variant="ghost"
                        className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                        aria-label="Close banner"
                    >
                        <X
                            size={16}
                            strokeWidth={2}
                            className="opacity-60 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            }
        >
            <div className="flex grow items-center justify-between gap-12">
                <p className="text-sm">You've made changes!</p>
            </div>
        </Alert>
    )
}

export { AlertSuccessWithAction }
