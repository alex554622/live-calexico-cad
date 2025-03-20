
import { z } from 'zod';

export interface ScheduleFormValues {
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  position: string;
}

export const scheduleFormSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  position: z.string().min(1, { message: "Position is required" }),
});

export type ScheduleFormSchema = z.infer<typeof scheduleFormSchema>;
