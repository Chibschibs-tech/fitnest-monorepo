import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    slug: "healthy-meal-prep",
    title: "10 Healthy Meal Prep Tips for Busy Professionals",
    excerpt: "Learn how to efficiently prepare nutritious meals for the entire week, even with a busy schedule.",
    category: "Meal Prep",
    readTime: "5 min read",
    date: "May 2, 2023",
    image: "/placeholder.svg?height=400&width=800",
    content: `
      <p>Meal prepping is a game-changer for busy professionals who want to maintain a healthy diet without spending hours in the kitchen every day. By dedicating a few hours each week to prepare your meals in advance, you can save time, money, and make healthier food choices throughout the week.</p>
      
      <h2>Why Meal Prep?</h2>
      <p>When you're busy with work and other responsibilities, it's easy to reach for convenient but unhealthy food options. Meal prepping eliminates the daily decision-making about what to eat, reduces the temptation to order takeout, and ensures you have nutritious meals ready when you need them.</p>
      
      <h2>10 Tips for Effective Meal Prepping</h2>
      
      <h3>1. Start with a Plan</h3>
      <p>Before you start cooking, plan your meals for the week. Consider your schedule, dietary preferences, and nutritional goals. Create a shopping list based on your meal plan to avoid impulse purchases and ensure you have all the ingredients you need.</p>
      
      <h3>2. Keep It Simple</h3>
      <p>You don't need to prepare elaborate meals with dozens of ingredients. Focus on simple, nutritious recipes that include a protein source, complex carbohydrates, and plenty of vegetables. Use herbs and spices to add flavor without extra calories.</p>
      
      <h3>3. Batch Cook Staples</h3>
      <p>Cook large batches of staple foods like brown rice, quinoa, roasted vegetables, and grilled chicken. These can be mixed and matched throughout the week to create different meals and prevent food boredom.</p>
      
      <h3>4. Invest in Quality Containers</h3>
      <p>Good quality, portion-sized containers are essential for meal prepping. Look for BPA-free, microwave-safe, and leak-proof options. Consider glass containers for better durability and to avoid potential chemical leaching from plastic.</p>
      
      <h3>5. Use Your Freezer</h3>
      <p>Not all prepped meals need to be eaten within a few days. Many dishes can be frozen for longer storage. Label your containers with the date and contents to keep track of what's in your freezer.</p>
      
      <h3>6. Prep Ingredients, Not Just Meals</h3>
      <p>If full meal prepping seems overwhelming, start by prepping ingredients. Wash and chop vegetables, marinate proteins, and prepare sauces or dressings in advance. This cuts down on daily cooking time while still allowing for fresh meals.</p>
      
      <h3>7. Embrace One-Pot Meals</h3>
      <p>Stews, soups, casseroles, and sheet pan meals are perfect for meal prepping. They're easy to make in large quantities, often taste better after a day or two as flavors meld, and can be portioned and frozen easily.</p>
      
      <h3>8. Don't Forget Snacks</h3>
      <p>Prepare healthy snacks like cut vegetables with hummus, Greek yogurt with berries, or homemade energy balls. Having nutritious snacks ready can prevent unhealthy grazing and keep your energy levels stable between meals.</p>
      
      <h3>9. Rotate Your Proteins</h3>
      <p>To avoid meal fatigue, use different protein sources throughout the week. For example, chicken on Monday, fish on Tuesday, legumes on Wednesday, etc. This provides dietary variety and ensures you get a range of nutrients.</p>
      
      <h3>10. Set Aside Dedicated Prep Time</h3>
      <p>Schedule a specific time each week for meal prepping and treat it as a non-negotiable appointment. Sunday afternoons are popular, but choose whatever works best for your schedule. Put on some music or a podcast to make the process more enjoyable.</p>
      
      <h2>Sample Meal Prep Menu</h2>
      <p>Here's a simple meal prep plan to get you started:</p>
      <ul>
        <li><strong>Breakfast:</strong> Overnight oats with berries and nuts</li>
        <li><strong>Lunch:</strong> Grilled chicken with roasted vegetables and quinoa</li>
        <li><strong>Dinner:</strong> Salmon with sweet potato and steamed broccoli</li>
        <li><strong>Snacks:</strong> Greek yogurt with honey, cut vegetables with hummus</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Meal prepping doesn't have to be complicated or time-consuming. Start small, find recipes you enjoy, and develop a routine that works for your lifestyle. With a little planning and preparation, you can enjoy healthy, homemade meals all week long, even with the busiest schedule.</p>
    `,
    author: "Nadia Benali",
    authorTitle: "Nutritionist & Meal Prep Specialist",
  },
  {
    id: 2,
    slug: "nutrition-myths",
    title: "5 Common Nutrition Myths Debunked",
    excerpt: "Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.",
    category: "Nutrition",
    readTime: "7 min read",
    date: "April 18, 2023",
    image: "/placeholder.svg?height=400&width=800",
    content: `
      <p>In the age of information overload, nutrition advice is everywhere. From social media influencers to well-meaning friends, everyone seems to have an opinion on what you should or shouldn't eat. Unfortunately, not all of this advice is based on sound science. Let's examine and debunk five common nutrition myths that persist despite evidence to the contrary.</p>
      
      <h2>Myth 1: Carbs Are Bad for You</h2>
      <p>One of the most pervasive nutrition myths is that carbohydrates are inherently fattening or unhealthy. This has led to the popularity of low-carb and keto diets. However, carbohydrates are the body's preferred source of energy and are essential for proper brain function.</p>
      
      <p><strong>The Truth:</strong> Not all carbs are created equal. Highly processed carbs like white bread, pastries, and sugary drinks can indeed contribute to weight gain and health problems when consumed in excess. However, complex carbohydrates found in whole grains, fruits, vegetables, and legumes are packed with fiber, vitamins, and minerals that are vital for good health.</p>
      
      <p>Research consistently shows that diets rich in whole, unprocessed carbohydrates are associated with lower risks of heart disease, certain cancers, and overall mortality. The Mediterranean diet, which includes plenty of whole grains, has been linked to numerous health benefits and longevity.</p>
      
      <h2>Myth 2: Eating Fat Makes You Fat</h2>
      <p>The low-fat craze of the 1980s and 1990s left a lasting impression that dietary fat is the primary culprit behind weight gain and heart disease. This led to an explosion of low-fat products, many of which were loaded with sugar to compensate for flavor.</p>
      
      <p><strong>The Truth:</strong> Dietary fat is an essential nutrient that plays crucial roles in hormone production, vitamin absorption, and brain health. Like carbohydrates, the type of fat matters more than the total amount.</p>
      
      <p>Unsaturated fats found in olive oil, avocados, nuts, and fatty fish have been shown to reduce inflammation and lower heart disease risk. Even saturated fats, once universally vilified, have a more nuanced role in health than previously thought. Trans fats, however, are indeed harmful and should be avoided.</p>
      
      <p>Weight gain occurs when you consume more calories than you burn, regardless of whether those calories come from fat, carbohydrates, or protein.</p>
      
      <h2>Myth 3: You Need to Detox Your Body with Special Diets or Cleanses</h2>
      <p>Detox diets and cleanses promise to rid your body of toxins, boost energy, and promote weight loss. These often involve severe calorie restriction, juice fasting, or expensive supplements.</p>
      
      <p><strong>The Truth:</strong> Your body has a sophisticated detoxification system that works around the clock. The liver, kidneys, digestive system, skin, and lungs all play roles in identifying, neutralizing, and eliminating harmful substances.</p>
      
      <p>No juice, tea, or supplement has been scientifically proven to enhance these natural processes. While some detox diets may lead to short-term weight loss due to calorie restriction, this is typically water weight that returns once normal eating resumes.</p>
      
      <p>The best way to support your body's natural detoxification processes is to eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins, stay hydrated, get regular exercise, and avoid excessive alcohol and tobacco.</p>
      
      <h2>Myth 4: Eating Small, Frequent Meals Boosts Metabolism</h2>
      <p>Many diet plans recommend eating 5-6 small meals throughout the day instead of 3 larger ones, claiming this "stokes the metabolic fire" and increases calorie burning.</p>
      
      <p><strong>The Truth:</strong> Research does not support the idea that meal frequency significantly impacts metabolic rate or weight loss. Total calorie intake and the quality of those calories matter much more than how often you eat.</p>
      
      <p>Some studies suggest that intermittent fasting or time-restricted eating may actually have metabolic benefits. The best meal frequency is the one that works for your lifestyle and helps you maintain a balanced diet without excessive hunger or overeating.</p>
      
      <h2>Myth 5: Natural Sugars Are Healthier Than Added Sugars</h2>
      <p>Many people believe that "natural" sweeteners like honey, agave nectar, or coconut sugar are significantly healthier alternatives to regular table sugar.</p>
      
      <p><strong>The Truth:</strong> While natural sweeteners may contain small amounts of nutrients that refined sugar lacks, your body processes all sugars in essentially the same way. Honey, maple syrup, agave, and table sugar all contain varying ratios of glucose and fructose, and all contribute to your total sugar intake.</p>
      
      <p>Some natural sweeteners have a slightly lower glycemic index, meaning they may cause a less dramatic spike in blood sugar. However, the difference is minimal from a health perspective, especially if consumed in similar quantities as regular sugar.</p>
      
      <p>All sugars should be consumed in moderation, regardless of their source. The World Health Organization recommends limiting added sugars to less than 10% of total daily calories, and ideally less than 5%.</p>
      
      <h2>Conclusion</h2>
      <p>Nutrition science is complex and constantly evolving, which makes it easy for myths and misconceptions to spread. The best approach to healthy eating is to focus on whole, minimally processed foods in appropriate portions, rather than vilifying or glorifying specific nutrients or following rigid rules.</p>
      
      <p>When evaluating nutrition claims, consider the source, look for scientific consensus rather than single studies, and remember that what works best for one person may not work for another due to individual differences in genetics, lifestyle, and preferences.</p>
    `,
    author: "Dr. Karim Tazi",
    authorTitle: "Registered Dietitian & Nutrition Researcher",
  },
  {
    id: 3,
    slug: "weight-loss-plateau",
    title: "Breaking Through a Weight Loss Plateau",
    excerpt: "Effective strategies to overcome stalled progress and continue your weight loss journey.",
    category: "Fitness",
    readTime: "8 min read",
    date: "April 5, 2023",
    image: "/placeholder.svg?height=400&width=800",
    content: `
      <p>You've been diligently following your diet and exercise plan, and initially, the pounds were melting away. But suddenly, the scale won't budge. You've hit the dreaded weight loss plateau. This frustrating but common phenomenon occurs when your body adapts to your weight loss regimen, making further progress challenging.</p>
      
      <p>Understanding why plateaus happen and how to overcome them can help you continue your weight loss journey successfully.</p>
      
      <h2>Why Weight Loss Plateaus Occur</h2>
      
      <h3>Metabolic Adaptation</h3>
      <p>As you lose weight, your metabolism naturally slows down. A smaller body requires fewer calories to function than a larger one. Additionally, your body becomes more efficient at the exercises you're doing regularly, burning fewer calories for the same activities.</p>
      
      <h3>Muscle vs. Fat</h3>
      <p>If you're strength training (which you should be!), you might be gaining muscle while losing fat. Since muscle is denser than fat, the scale might not reflect your body composition changes, even though you're making progress.</p>
      
      <h3>Water Retention</h3>
      <p>Factors like sodium intake, hormonal fluctuations, and even starting a new exercise routine can cause temporary water retention, masking fat loss on the scale.</p>
      
      <h3>Calorie Creep</h3>
      <p>Over time, portion sizes might gradually increase, or small, unaccounted snacks might find their way into your diet. These "hidden" calories can add up and stall your progress.</p>
      
      <h2>Strategies to Break Through Your Plateau</h2>
      
      <h3>1. Reassess Your Calorie Needs</h3>
      <p>As you lose weight, your calorie requirements decrease. Recalculate your calorie needs based on your current weight, not your starting weight. Consider reducing your daily intake by 100-200 calories, but never go below 1,200 calories for women or 1,500 for men without medical supervision.</p>
      
      <h3>2. Track Everything</h3>
      <p>Start logging your food intake meticulously. Research shows that people tend to underestimate their calorie consumption by 20-30%. Use a food scale and measuring cups to ensure accuracy. Don't forget to count cooking oils, condiments, and beverages.</p>
      
      <h3>3. Change Your Exercise Routine</h3>
      <p>Your body adapts to exercise, becoming more efficient and burning fewer calories. Introduce new activities that challenge different muscle groups. If you usually do steady-state cardio, try high-intensity interval training (HIIT). If you focus on cardio, add strength training to build metabolism-boosting muscle.</p>
      
      <h3>4. Increase Protein Intake</h3>
      <p>Protein has a higher thermic effect than carbohydrates or fats, meaning your body burns more calories digesting it. It also helps preserve muscle mass during weight loss and increases satiety. Aim for 0.7-1 gram of protein per pound of body weight daily.</p>
      
      <h3>5. Manage Stress</h3>
      <p>Chronic stress increases cortisol levels, which can promote fat storage, particularly around the abdomen. Incorporate stress-reduction techniques like meditation, yoga, or deep breathing exercises into your routine.</p>
      
      <h3>6. Prioritize Sleep</h3>
      <p>Poor sleep disrupts hunger hormones, increases cravings, and reduces energy for physical activity. Aim for 7-9 hours of quality sleep each night. Establish a regular sleep schedule and create a restful environment by limiting screen time before bed.</p>
      
      <h3>7. Try Intermittent Fasting</h3>
      <p>Some research suggests that intermittent fasting can help break through plateaus by improving insulin sensitivity and promoting fat burning. Common approaches include the 16/8 method (fasting for 16 hours and eating during an 8-hour window) or the 5:2 method (eating normally five days a week and restricting calories on two non-consecutive days).</p>
      
      <h3>8. Increase Non-Exercise Activity</h3>
      <p>Non-exercise activity thermogenesis (NEAT) refers to the calories burned during everyday activities like walking, cleaning, and fidgeting. Look for ways to increase movement throughout your day: take the stairs, park farther away, use a standing desk, or take short walking breaks every hour.</p>
      
      <h3>9. Consider a Refeed Day</h3>
      <p>After extended periods of calorie restriction, a planned higher-calorie day can boost leptin levels (a hormone that regulates hunger and metabolism). This isn't a cheat day—focus on increasing healthy carbohydrates while maintaining protein intake and keeping fat moderate.</p>
      
      <h3>10. Be Patient and Reassess Your Goals</h3>
      <p>Sometimes what seems like a plateau is actually your body reaching its natural, healthy weight. Consider whether your weight goal is realistic for your body type, age, and lifestyle. Focus on non-scale victories like improved energy, better-fitting clothes, or enhanced athletic performance.</p>
      
      <h2>When to Seek Professional Help</h2>
      <p>If you've tried these strategies consistently for several weeks without results, consider consulting a healthcare provider. Certain medical conditions like hypothyroidism, polycystic ovary syndrome (PCOS), or medications can make weight loss more challenging.</p>
      
      <h2>Conclusion</h2>
      <p>Weight loss plateaus are a normal part of the journey, not a sign of failure. They often signal that your body is adapting and it's time to adjust your approach. By implementing these strategies and maintaining a positive mindset, you can overcome plateaus and continue progressing toward your health and fitness goals.</p>
      
      <p>Remember that sustainable weight loss is a marathon, not a sprint. Small, consistent changes yield the best long-term results.</p>
    `,
    author: "Yasmine Lahlou",
    authorTitle: "Certified Personal Trainer & Weight Management Specialist",
  },
  {
    id: 4,
    slug: "protein-importance",
    title: "Why Protein is Essential for Muscle Building",
    excerpt: "Understanding the role of protein in muscle development and recovery, and how to optimize your intake.",
    category: "Nutrition",
    readTime: "6 min read",
    date: "March 22, 2023",
    image: "/placeholder.svg?height=400&width=800",
    content: `
      <p>Whether you're an athlete, a fitness enthusiast, or someone looking to improve your body composition, understanding the role of protein in muscle building is crucial. Protein is often called the building block of muscle, but its functions extend far beyond that simple description.</p>
      
      <h2>The Science of Muscle Building</h2>
      <p>Muscle growth, or hypertrophy, occurs when muscle protein synthesis exceeds muscle protein breakdown. Resistance training creates microscopic damage to muscle fibers, and during recovery, your body repairs this damage by fusing muscle fibers together, increasing muscle size and strength. Protein provides the amino acids necessary for this repair and growth process.</p>
      
      <h2>Why Protein Is Essential</h2>
      
      <h3>Provides Building Blocks</h3>
      <p>Proteins are made up of amino acids, which are the fundamental building blocks for muscle tissue. Of the 20 amino acids, nine are considered essential, meaning your body cannot produce them, and they must come from your diet.</p>
      
      <h3>Supports Recovery</h3>
      <p>Adequate protein intake accelerates recovery after exercise by repairing damaged muscle fibers and reducing muscle soreness. This allows for more frequent and effective training sessions.</p>
      
      <h3>Preserves Lean Mass During Weight Loss</h3>
      <p>If you're in a caloric deficit to lose weight, sufficient protein intake helps preserve lean muscle mass, ensuring that most of the weight lost comes from fat rather than muscle.</p>
      
      <h3>Increases Metabolic Rate</h3>
      <p>Protein has a higher thermic effect compared to carbohydrates and fats, meaning your body burns more calories digesting protein. Additionally, muscle tissue is metabolically active, so building and maintaining muscle increases your resting metabolic rate.</p>
      
      <h3>Enhances Satiety</h3>
      <p>Protein-rich foods help you feel fuller longer, which can prevent overeating and support weight management goals.</p>
      
      <h2>How Much Protein Do You Need?</h2>
      <p>The optimal protein intake varies based on individual factors such as activity level, age, weight, and goals:</p>
      
      <ul>
        <li><strong>Sedentary adults:</strong> 0.8g per kg of body weight (the RDA)</li>
        <li><strong>Recreational exercisers:</strong> 1.1-1.4g per kg of body weight</li>
        <li><strong>Endurance athletes:</strong> 1.2-1.6g per kg of body weight</li>
        <li><strong>Strength and power athletes:</strong> 1.6-2.0g per kg of body weight</li>
        <li><strong>Athletes in a caloric deficit:</strong> Up to 2.3g per kg of body weight to preserve lean mass</li>
      </ul>
      
      <p>For most people actively trying to build muscle, aiming for 1.6-2.2g of protein per kg of body weight (or about 0.7-1g per pound) is a good target.</p>
      
      <h2>Timing and Distribution</h2>
      <p>Research suggests that distributing protein intake evenly throughout the day is more effective for muscle protein synthesis than consuming the majority of your protein in one meal. Aim for 20-40g of high-quality protein every 3-4 hours.</p>
      
      <p>The "anabolic window" immediately after exercise was once considered crucial for protein consumption, but recent research shows that total daily protein intake is more important than precise timing. That said, consuming protein within a couple of hours before or after training may still be beneficial, particularly for those training in a fasted state.</p>
      
      <h2>Quality Matters</h2>
      <p>Not all protein sources are created equal. Proteins are evaluated based on:</p>
      
      <h3>Biological Value</h3>
      <p>This measures how efficiently the body can use the protein. Animal proteins generally have higher biological values than plant proteins.</p>
      
      <h3>Amino Acid Profile</h3>
      <p>Complete proteins contain all nine essential amino acids in adequate amounts. Most animal proteins are complete, while many plant proteins (with exceptions like soy, quinoa, and buckwheat) are incomplete and should be combined with complementary proteins.</p>
      
      <h3>Leucine Content</h3>
      <p>Leucine is a branched-chain amino acid that acts as a key trigger for muscle protein synthesis. Whey protein, eggs, and lean meats are particularly rich in leucine.</p>
      
      <h2>Top Protein Sources</h2>
      
      <h3>Animal-Based Proteins</h3>
      <ul>
        <li><strong>Whey protein:</strong> Rapidly digested, high in leucine, excellent post-workout</li>
        <li><strong>Casein protein:</strong> Slowly digested, good for sustained amino acid release</li>
        <li><strong>Eggs:</strong> High biological value, versatile, contain additional nutrients</li>
        <li><strong>Lean meats:</strong> Chicken, turkey, lean beef, pork tenderloin</li>
        <li><strong>Fish:</strong> Provides protein plus omega-3 fatty acids</li>
        <li><strong>Greek yogurt:</strong> Higher in protein than regular yogurt, contains probiotics</li>
      </ul>
      
      <h3>Plant-Based Proteins</h3>
      <ul>
        <li><strong>Soy:</strong> Complete protein, available as tofu, tempeh, edamame</li>
        <li><strong>Legumes:</strong> Lentils, chickpeas, black beans</li>
        <li><strong>Quinoa:</strong> Complete protein grain</li>
        <li><strong>Seitan:</strong> Wheat protein with meat-like texture</li>
        <li><strong>Plant protein powders:</strong> Pea, rice, hemp blends</li>
        <li><strong>Nuts and seeds:</strong> Also provide healthy fats</li>
      </ul>
      
      <h2>Common Protein Myths</h2>
      
      <h3>Myth: Excessive protein damages kidneys</h3>
      <p>For healthy individuals, research does not support the notion that high protein intake harms kidney function. However, those with existing kidney disease should follow medical advice regarding protein consumption.</p>
      
      <h3>Myth: Plant proteins are inferior for muscle building</h3>
      <p>While some plant proteins have lower digestibility and incomplete amino acid profiles, a well-planned plant-based diet with varied protein sources can effectively support muscle growth.</p>
      
      <h3>Myth: Protein supplements are necessary</h3>
      <p>Whole food sources can provide all the protein you need. Supplements offer convenience but aren't nutritionally superior to food.</p>
      
      <h2>Conclusion</h2>
      <p>Protein is undeniably essential for muscle building, but it's just one piece of the puzzle. Optimal results come from combining adequate protein intake with proper resistance training, sufficient calories, quality carbohydrates for energy, healthy fats, and enough rest for recovery.</p>
      
      <p>By understanding protein's role and implementing strategic consumption, you can maximize your muscle-building potential and achieve your fitness goals more effectively.</p>
    `,
    author: "Omar Benjelloun",
    authorTitle: "Sports Nutritionist & Strength Coach",
  },
  {
    id: 5,
    slug: "mindful-eating",
    title: "The Art of Mindful Eating: Improving Your Relationship with Food",
    excerpt: "How practicing mindfulness during meals can transform your eating habits and overall well-being.",
    category: "Wellness",
    readTime: "9 min read",
    date: "March 10, 2023",
    image: "/placeholder.svg?height=400&width=800",
    content: `
      <p>In our fast-paced world, eating has often become a mindless activity—something we do while working at our desks, scrolling through social media, or watching television. We consume meals in minutes without truly tasting our food or recognizing when we're full. This disconnected approach to eating can lead to poor digestion, overeating, and an unhealthy relationship with food.</p>
      
      <p>Mindful eating offers an alternative—a way to transform your meals into opportunities for awareness, appreciation, and nourishment on multiple levels.</p>
      
      <h2>What Is Mindful Eating?</h2>
      <p>Mindful eating is based on the Buddhist concept of mindfulness, which involves being fully present and engaged in the current moment without judgment. When applied to eating, it means:</p>
      
      <ul>
        <li>Paying full attention to the experience of eating and drinking</li>
        <li>Noticing the colors, smells, textures, flavors, temperatures, and sounds of your food</li>
        <li>Recognizing your body's hunger and fullness cues</li>
        <li>Acknowledging your responses to food (likes, dislikes, neutral) without judgment</li>
        <li>Becoming aware of the origins of your food and the journey it took to reach your plate</li>
      </ul>
      
      <p>Mindful eating is not a diet. There are no menus or food restrictions. It's about changing how you eat, not what you eat—though many people find that their food choices naturally improve as they become more mindful.</p>
      
      <h2>The Benefits of Mindful Eating</h2>
      
      <h3>Physical Benefits</h3>
      <ul>
        <li><strong>Better digestion:</strong> Eating slowly and chewing thoroughly improves digestion and nutrient absorption.</li>
        <li><strong>Natural weight management:</strong> By recognizing true hunger and fullness signals, you're less likely to overeat.</li>
        <li><strong>Reduced binge eating:</strong> Research shows mindful eating can help reduce binge eating and emotional eating behaviors.</li>
        <li><strong>Improved glycemic control:</strong> Some studies suggest mindful eating may help stabilize blood sugar levels.</li>
      </ul>
      
      <h3>Psychological Benefits</h3>
      <ul>
        <li><strong>Greater enjoyment of food:</strong> When you pay attention, you extract more pleasure from eating.</li>
        <li><strong>Reduced food anxiety:</strong> Mindful eating helps break the cycle of guilt and anxiety around food.</li>
        <li><strong>Better body image:</strong> Developing a healthier relationship with food often translates to a healthier relationship with your body.</li>
        <li><strong>Stress reduction:</strong> Mindful meals provide a break from the day's stresses and an opportunity to practice presence.</li>
      </ul>
      
      <h2>How to Practice Mindful Eating</h2>
      
      <h3>1. Create a Distraction-Free Environment</h3>
      <p>Turn off the television, put away your phone, and close your laptop. Designate your eating area as a technology-free zone. If possible, sit at a table rather than eating on the couch or in bed.</p>
      
      <h3>2. Begin with Gratitude</h3>
      <p>Before eating, take a moment to appreciate the food in front of you. Consider all the people involved in bringing this food to your plate—farmers, truck drivers, grocery store workers, and those who prepared the meal.</p>
      
      <h3>3. Engage All Your Senses</h3>
      <p>Before taking your first bite:</p>
      <ul>
        <li>Observe the visual aspects of your food—colors, shapes, arrangement on the plate</li>
        <li>Notice the aromas and how they make you feel</li>
        <li>If appropriate, touch your food to experience its texture</li>
        <li>Listen to the sounds as you cut, stir, or prepare to eat your food</li>
      </ul>
      
      <h3>4. Take Small Bites and Chew Thoroughly</h3>
      <p>Try to chew each bite 20-30 times before swallowing. Notice how the flavor and texture change as you chew. This not only enhances the eating experience but also improves digestion and gives your body time to register fullness.</p>
      
      <h3>5. Put Down Your Utensils Between Bites</h3>
      <p>This simple act creates natural pauses in your meal, slowing down the process and giving you time to savor each bite fully before moving on to the next.</p>
      
      <h3>6. Check In With Your Hunger Throughout the Meal</h3>
      <p>Use a hunger-fullness scale of 1-10, where 1 is extremely hungry and 10 is uncomfortably full. Aim to start eating around 3 (definitely hungry but not starving) and stop around 7 (satisfied but not stuffed).</p>
      
      <h3>7. Notice Without Judgment</h3>
      <p>If you catch yourself eating quickly or mindlessly, simply notice it without criticism and gently bring your attention back to the present moment. Mindful eating, like any practice, develops over time.</p>
      
      <h2>Mindful Eating in Daily Life</h2>
      
      <h3>Start Small</h3>
      <p>You don't need to make every meal a full mindful eating experience, especially when beginning. Try practicing with one meal per day or even just the first few minutes of a meal.</p>
      
      <h3>Mindful Snacking</h3>
      <p>Snacking is often where mindlessness creeps in. Before reaching for a snack, pause and ask: "Am I physically hungry, or am I eating for another reason?" If you're truly hungry, choose your snack deliberately and eat it with the same attention you would give a meal.</p>
      
      <h3>Mindful Food Shopping</h3>
      <p>Extend mindfulness to your grocery shopping. Create a list before going to the store, shop the perimeter first where whole foods are typically located, and read labels mindfully, considering how different foods will nourish your body.</p>
      
      <h3>Mindful Cooking</h3>
      <p>Approach cooking as a mindful activity rather than a chore. Engage your senses in the preparation process—the sound of vegetables being chopped, the smell of spices, the changing colors of food as it cooks.</p>
      
      <h2>Overcoming Common Challenges</h2>
      
      <h3>Time Constraints</h3>
      <p>Even with a busy schedule, you can incorporate elements of mindful eating. If you only have 15 minutes for lunch, spend the first and last minute in complete presence with your food.</p>
      
      <h3>Social Situations</h3>
      <p>It can be challenging to eat mindfully in social settings. Focus on balancing social engagement with moments of awareness about your food and body signals.</p>
      
      <h3>Emotional Eating</h3>
      <p>When you notice the urge to eat in response to emotions, pause and take three deep breaths. Ask yourself what you're really hungry for—is it food, or comfort, distraction, or connection?</p>
      
      <h2>Conclusion</h2>
      <p>Mindful eating is a powerful practice that can transform your relationship with food and nourishment. It reconnects you with your body's wisdom and the pleasure of eating. In a world that often promotes quick fixes and complicated diet rules, mindful eating offers a sustainable, compassionate approach to nourishment that honors both physical health and emotional well-being.</p>
      
      <p>Remember that mindful eating is a practice, not a perfect. Approach it with curiosity and kindness, and notice how your relationship with food gradually evolves.</p>
    `,
    author: "Fatima El Ouazzani",
    authorTitle: "Mindfulness Coach & Holistic Nutritionist",
  },
]

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="flex items-center text-fitnest-green hover:bg-gray-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
              {post.category}
            </span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {post.date}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Author info */}
          <div className="flex items-center mb-6">
            <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-500 mr-3">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-gray-500">{post.authorTitle}</p>
            </div>
          </div>
        </div>

        {/* Featured image */}
        <div className="relative h-[250px] sm:h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority
          />
        </div>

        {/* Article content */}
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Related posts */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {blogPosts
              .filter((relatedPost) => relatedPost.id !== post.id)
              .slice(0, 3)
              .map((relatedPost) => (
                <div key={relatedPost.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-32 sm:h-40">
                    <Image
                      src={relatedPost.image || "/placeholder.svg"}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-base md:text-lg font-bold mt-2 mb-1 line-clamp-2">{relatedPost.title}</h3>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white text-sm"
                      >
                        Read Article
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
