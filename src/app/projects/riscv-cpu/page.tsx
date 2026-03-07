import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image";

import Link from "next/link";

const images = [
  { id: 0, file: "/fetch_stage.png" , alt: "Fetch Stage"},
  { id: 1, file: "/decode_stage.png" , alt: "Decode Stage"},
  { id: 2, file: "/ex_stage.png" , alt: "Execute Stage"},
  { id: 3, file: "/mem_stage.png" , alt: "Memory Stage"},
  { id: 4, file: "/wb_stage.png" , alt: "Writeback Stage"},
]

export default function RISCVCPUPage(){
  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>RISC-V Multistage Pipelined CPU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-between gap-x-3">
            <div className="max-w-9/10">
              <p>
                This 5-stage pipelined CPU supports the RV32I RISC-V instruction set architecture (ISA). 
                The processor also includes RAW hazard detection, branch prediction, and a direct-mapped cache (see MEM stage). 
                The main bottlenecks are the cache miss rate and the BTB miss rate, 
                both of which necessitate processor stalls (incurring instruction delays).‍
              </p>
                
              <br/>
              Tests included: 
                <ul>
                 <li>- Mixed program (programs with poor functional locality) </li>
                 <li>- Matrix multiplication (no optimization) </li>
                 <li>- Matrix multiplication (-O3 compiler optimization) </li>
               </ul>

              <br/>
              [<Link href="https://github.com/ardenpalme/Academic-Projects/tree/master/RISCV_CPU" className="text-blue-600">source code</Link>]
            </div>
            <div className="max-w-3/4 p-2 relative ">
              <Carousel
                opts={{
                  align: "start",
                }}
                >
                <CarouselContent>
                  {images.map((img) => (
                    <CarouselItem key={img.id} className="flex aspect-square items-start justify-center p-6 max-h-80">
                    <Image
                      src={img.file}
                      width={500}
                      height={500}
                      alt={img.alt}
                      className=""
                    />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="cursor-pointer"/>
                <CarouselNext className="cursor-pointer"/>
              </Carousel>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
