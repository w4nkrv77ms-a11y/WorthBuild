/* IdeaWorth × Paddle Billing configuration
 * Client-side token is safe to expose in frontend code. Never put a Paddle API key here.
 * Replace the placeholders below with values from Paddle > My account > Settings > Authentication
 * and the corresponding one-time price IDs from Paddle Products.
 */
window.IDEAWORTH_PADDLE = {
  token: "REPLACE_WITH_PADDLE_CLIENT_SIDE_TOKEN",
  environment: "live",
  prices: {
    100: "REPLACE_WITH_PRICE_ID_100",
    200: "REPLACE_WITH_PRICE_ID_200",
    400: "REPLACE_WITH_PRICE_ID_400",
    800: "REPLACE_WITH_PRICE_ID_800",
    1600: "REPLACE_WITH_PRICE_ID_1600"
  }
};
