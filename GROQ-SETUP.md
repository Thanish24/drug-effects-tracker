# Groq API Setup Guide

## 🚀 **Why Groq?**
- **Faster**: Up to 10x faster than OpenAI
- **Cheaper**: More affordable pricing
- **Open Source Models**: Uses Llama models
- **Same API**: Compatible with OpenAI format

## 🔑 **Step 1: Get Your Groq API Key**

1. **Visit Groq Console**: https://console.groq.com/
2. **Sign up** with your email or Google account
3. **Navigate to API Keys** in the left sidebar
4. **Click "Create API Key"**
5. **Copy the key** (starts with `gsk_...`)

## ⚙️ **Step 2: Update Your .env File**

Add this line to your `.env` file:

```env
# Groq Configuration (faster and cheaper than OpenAI)
GROQ_API_KEY=gsk_your_actual_key_here
```

## 🧪 **Step 3: Test the Integration**

Run the test script:
```bash
node test-groq-integration.js
```

## 📊 **Available Models**

- `llama3-8b-8192` - Fast, good for most tasks
- `llama3-70b-8192` - More powerful, slower
- `mixtral-8x7b-32768` - Good balance
- `gemma-7b-it` - Google's model

## 💰 **Pricing (Much Cheaper!)**

- **Llama 3 8B**: $0.05 per 1M input tokens, $0.05 per 1M output tokens
- **Llama 3 70B**: $0.59 per 1M input tokens, $0.79 per 1M output tokens
- **Mixtral 8x7B**: $0.24 per 1M input tokens, $0.24 per 1M output tokens

Compare to OpenAI:
- **GPT-3.5**: $0.50 per 1M input tokens, $1.50 per 1M output tokens
- **GPT-4**: $30 per 1M input tokens, $60 per 1M output tokens

## 🎯 **Benefits for Your Project**

1. **Faster Analysis**: Side effect analysis will be much quicker
2. **Lower Costs**: Much cheaper for testing and production
3. **Better Performance**: Groq is optimized for speed
4. **Same Quality**: Llama models are very capable

## 🔧 **Fallback**

If you don't want to use Groq, the system will automatically fall back to basic analysis without AI features.
