const args = { name: "Abebe", phone: "0911223344", preferred_date: "tomorrow", requested_service: "manual therapy" };
const fRes = fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
        access_key: 'c04030b1-d612-4a98-9971-c1ce7306ee7c',
        subject: `Chatbot Appointment Request from ${args.name}`,
        from_name: 'Nova Clinic AI Assistant',
        name: args.name,
        phone: args.phone,
        email: args.email || 'abuzzer371@gmail.com',
        preferred_date: args.preferred_date,
        requested_service: args.requested_service,
        notes: args.notes || '',
        message: `Appointment booked via AI Assistant.\nService: ${args.requested_service}\nDate: ${args.preferred_date}`
    })
}).then(r => r.json()).then(console.log).catch(console.error);
