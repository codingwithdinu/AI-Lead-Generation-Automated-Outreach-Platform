import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

export default {
  async fetch(req: Request) {
    try {
      const body = await req.json();

      console.log("Calendly Webhook:", body);

      if (body.event !== "invitee.created") {
        return Response.json({
          success: true,
          message: "Ignored event",
        });
      }

      const payload = body.payload;

      const email = payload?.email;
      const name = payload?.name;

      console.log("EMAIL:", email);

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("email", email)
        .single();

      console.log("LEAD:", lead);
      console.log("LEAD ERROR:", leadError);

      if (!lead) {
        return Response.json({
          success: false,
          message: "Lead not found",
          error: leadError?.message,
        });
      }

      const meetingDate =
        payload?.scheduled_event?.start_time ||
        new Date().toISOString();

      const meetingLink =
        payload?.scheduled_event?.uri || "";

      const { error: insertError } = await supabase
        .from("discovery_calls")
        .insert({
          user_id: lead.user_id,
          lead_id: lead.id,
          meeting_date: meetingDate,
          status: "Scheduled",
          meeting_link: meetingLink,
        });

      console.log("INSERT ERROR:", insertError);

      if (insertError) {
        return Response.json({
          success: false,
          error: insertError.message,
        });
      }

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          status: "Discovery Scheduled",
        })
        .eq("id", lead.id);

      console.log("UPDATE ERROR:", updateError);

      return Response.json({
        success: true,
        invitee: name,
      });
    } catch (err: any) {
      console.error("WEBHOOK ERROR:", err);

      return Response.json(
        {
          success: false,
          error: err.message,
        },
        {
          status: 500,
        }
      );
    }
  },
};