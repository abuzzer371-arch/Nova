import fetch from "node-fetch";

async function run() {
    const history = [
        { role: 'user', text: 'የክሊኒኩን የህክምና አገልግሎት ንገረኝ' },
        { role: 'model', text: 'በኖቫ የፊዚዮቴራፒ...' },
        { role: 'user', text: 'ቦሌ የት አካባቢ' }
    ];
    
    const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ቦሌ የት አካባቢ', history: history })
    });
    console.log(await res.text());
}
run();
