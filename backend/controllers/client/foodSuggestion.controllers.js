const Product = require("../../models/product.model")

module.exports.recommend = async (req, res) => {
  

     const selectedFood = req.body.selectedFood
     console.log("Selected food:", selectedFood)
        try {

            const products = await Product.find({
                status: "active",
                deleted: false
            })

            const menu = products.map(p => [p.name, String(p._id)])

            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "Bạn là AI gợi ý món ăn trong quán."
                            },
                            {
                                role: "user",
                                content: `
                        Menu quán gồm:
                        ${menu.map(item => `${item[0]} (${item[1]})`).join(", ")}

                        Khách hàng vừa gọi: ${selectedFood}

                        Hãy chọn 3 món trong menu phù hợp nhất để ăn kèm.

                        Chỉ trả về JSON array bao gồm ID của các món.
                        Ví dụ: ["id1","id2","id3"]
    `
                            }
                        ]
                    })
                }
            )

            const aiData = await response.json()

            let aiResult = aiData.choices[0].message.content
            aiResult = aiResult.replace(/```json|```/g, "").trim()
            const suggestedIds = JSON.parse(aiResult)
            const dataProducts = await Product.find({
                _id:{$in: suggestedIds }
            })
            if(dataProducts){
                return res.status(200).json({
                    dataSuggestion: dataProducts
                })
            }else{
                const dataProducts = await Product.find({
                    featured:"1"
                }).limit(3)
                return res.status(200).json({
                    dataSuggestion: dataProducts
                })
            }
            // if(!Array.isArray(suggestedIds) || suggestedIds.length !== 3) {
            //     const dataProducts = Product.find({
            //         featured:"1"
            //     }).limit(3)
            //     return res.json({
            //         datSuggestion: dataProducts
            //     })
            // }else{
            //     const dataProducts = await Product.find({
            //         _id: { $in: suggestedIds }
            //     })
            //     return res.json({
            //         datSuggestion: dataProducts
            //     })
            //     console.log("demo data:", dataProducts)
            // }
            // console.log("Suggested IDs:", suggestedIds)
            // res.json({
            //     suggestion: suggestedIds
            // })

        } catch (err) {

            console.log("AI ERROR:", err)

            res.status(500).json({
                error: "AI error"
            })
        }

}