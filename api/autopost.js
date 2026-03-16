import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
    // 1. SECURITY: Ensure Vercel Cron triggered this (blocks random internet users)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 2. WAKE UP GROQ
        const groqPrompt = "You are an energetic, hype-focused social media manager for a new streaming platform called Jailex. Write a short, engaging X (Twitter) post promoting the website 'jailex.net'. Keep it under 250 characters. Use relevant hashtags. Do not use quotes around the tweet.";
        
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {role: "system", content: groqPrompt}, 
                    {role: "user", content: "Write the next promotional tweet right now."}
                ],
                max_tokens: 100,
                temperature: 0.9
            })
        });

        const groqData = await groqRes.json();
        let tweetText = groqData.choices[0].message.content.trim().replace(/^"|"$/g, '');

        // 3. WAKE UP X (TWITTER) ENGINE
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        // 4. FIRE THE TWEET
        const { data: createdTweet } = await client.v2.tweet(tweetText);

        // 5. REPORT SUCCESS
        return res.status(200).json({ 
            success: true, 
            tweet_id: createdTweet.id, 
            content: tweetText 
        });

    } catch (error) {
        console.error("BOT CRASH:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
