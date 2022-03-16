module.exports = {
    initiationTicketMail: async (data) => {
        return `
        <p>Hi ${data.user.dataValues.name}!</p>
        <p>We got your ticket in our system - Conversation with ${data.user.dataValues.name} (<a href="https://impact-help-frontend-i8ybqhqy3-subham043.vercel.app/view-ticket/${data.id}">#${data.id}</a>)
        A HighLevel support rep will review your ticket and get back to you shortly.
        While you wait, you could reply to this email and provide additional details that could help us troubleshoot your issue sooner (<strong>if applicable</strong>):</p>
        <ol>
        <li>Login Email</li>
        <li><a href="https://www.loom.com/">Loom Video</a> reproducing the issue</li>
        <li>Contact/Lead Example</li>
        <li>Any other piece of relevant information (Campaign Name, Trigger Name, Form Name, Funnel Name...)</li>
        </ol>
        <p>*You can disregard this email if you just submitted a service request through the Marketplace
        or
        If you have a paid Premium Support subscription</p>
        `;
    },
    closeTicketMail: async (data) => {
        return `
        <p>Hi ${data.user.dataValues.name}!</p>
        <p>Your ticket - Conversation with ${data.user.dataValues.name} (<a href="https://impact-help-frontend-i8ybqhqy3-subham043.vercel.app/view-ticket/${data.id}">#${data.id}</a>) -  has been marked as <strong>Completed</strong>.</p>
        <p>We believe we have resolved your issue or answered all of your questions.</p>
        <p>If you believe that this ticket should not be closed for any reason, please reply to this email and it will reopen the ticket.</p>
        <p>Sincerely,<br />
        Impact School Support Team </p>
        `;
    },
    waitTicketMail: async (data) => {
        return `
        <p>Hi ${data.user.dataValues.name}!</p>
        <p>Your ticket - Conversation with ${data.user.dataValues.name} (<a href="https://impact-help-frontend-i8ybqhqy3-subham043.vercel.app/view-ticket/${data.id}">#${data.id}</a>) -  has been marked as <strong>Pending From Client</strong>.</p>
        <p>If we don’t receive response within 3 days, we will go ahead and close the ticket and you can always raise a new ticket.</p>
        <p>Sincerely,<br />
        Impact School Support Team </p>
        `;
    },
}