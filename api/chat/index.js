module.exports = async function (context, req) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  context.res = {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
};