
import { supabase } from "@/integrations/supabase/client";
import { ScheduleFormSchema } from "@/components/scheduling/types";
import { format } from "date-fns";

export async function createSchedule(scheduleData: ScheduleFormSchema) {
  const { data, error } = await supabase
    .from('employee_schedules')
    .insert({
      employee_id: scheduleData.employeeId,
      date: format(scheduleData.date, 'yyyy-MM-dd'), // Convert Date to string in ISO format
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      position: scheduleData.position
    })
    .select();

  if (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }

  return data;
}

export async function getSchedules() {
  const { data, error } = await supabase
    .from('employee_schedules')
    .select('*');

  if (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }

  return data;
}
