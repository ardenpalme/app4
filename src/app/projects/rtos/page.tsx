import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image";

import Link from "next/link";

export default function RISCVCPUPage(){
  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Kernel</CardTitle>
          <CardDescription>
            Developed a real-time kernel capable of admission control, task scheduling, isolation, and synchronization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-x-3">
            <div className="max-w-7/10">
              <p> 
                  Additionally designed a PCB shield in EagleCAD for an STM32 Nucleo Board (ARM Cortex M4) 
                  to attach peripherals (e.g. h-bridge and servo motoro). The kernel ran on the STM bare-metal (with boot.S loader).
              </p>
              <br/>
              <p> This kernel implemented mutexes and the Immediate Priority Ceiling Protocol (IPCP),
                  and used the Memory Protection Unit (MPU) to protect kernel memory when in user mode, 
                  and to isolate a thread’s stack from other threads. 
              </p>

              <br/>
              The lab was divided into three main parts: 
              <ul>
                <li> (i) Context switching and task management.</li>
                <li> (ii) Fixed priority rate-monotonic scheduling.</li>
                <li> (iii) Isolation and real-time synchronization.</li>
              </ul>

              <br/>
              [<Link href="https://github.com/ardenpalme/Academic-Projects/tree/master/ARM_RTOS" className="text-blue-600">source code</Link>]
            </div>
            <Image
              src={"/PCB.png"}
              width={500}
              height={500}
              alt="PCB Designed with EagleCAD"
              className="p-2 max-w-60"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

