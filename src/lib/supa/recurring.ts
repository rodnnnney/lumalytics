import { getAllTables } from "./fetchAllTables";
import supabase from "./supa";

export async function findRecurringStudents() {
  try {
    const tableNames = await getAllTables();
    let recurringStudentsNames = [];
    let recurringStudentsEmails = [];

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      //get names
      const { data: names, error: nameError } = await supabase
        .from(tableName)
        .select("name")
        .eq("approval_status", "approved")
        .neq("checked_in_at", null);

      if (nameError) {
        console.error("Error fetching names: ", nameError);
      }
      if (names != null) {
        recurringStudentsNames.push(...names);
      }

      //get emails
      const { data: emails, error: emailError } = await supabase
        .from(tableName)
        .select("email");

      if (emailError) {
        console.error("Error fetching emails: ", emailError);
      }
      if (emails != null) {
        recurringStudentsEmails.push(...emails);
      }
    }

    console.log("Recurring Student Names:", recurringStudentsNames);
    console.log("Recurring Student Emails:", recurringStudentsEmails);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
