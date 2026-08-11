const fs = require('fs');
const path = require('path');

const generateData = () => {
    const data = [];

    // 1. Chào hỏi (Greetings)
    data.push({ keywords: ["chào", "xin chào", "hello", "hi", "hey", "chào bạn", "alo", "ê", "chào shop", "chào ad"], answer: "Chào mừng bạn đến với nhà hàng! 🌟 Tôi là Trợ lý AI VIP. Bạn đang thèm món gì, hay cần đặt bàn, xem menu? Hãy cho tôi biết nhé!" });
    data.push({ keywords: ["tên gì", "bạn là ai", "ai đấy", "bot", "ai"], answer: "Tôi là Trợ lý AI thông minh của nhà hàng, luôn túc trực 24/7 để giúp bạn đặt món, xem menu và giải đáp mọi thắc mắc! 🤖" });
    data.push({ keywords: ["cảm ơn", "thank you", "thanks", "tốt", "tuyệt", "giỏi quá", "ok", "oke", "dạ vâng", "rồi"], answer: "Dạ không có gì! Phục vụ bạn là niềm vui của tôi. Chúc bạn một ngày tuyệt vời và một bữa ăn thật ngon miệng! ❤️" });
    data.push({ keywords: ["chúc ngủ ngon", "tạm biệt", "bye", "goodbye"], answer: "Tạm biệt bạn! Hẹn gặp lại bạn tại nhà hàng vào một ngày gần nhất nhé! 👋" });
    data.push({ keywords: ["buổi sáng", "chào buổi sáng", "good morning"], answer: "Chào buổi sáng! 🌅 Bắt đầu ngày mới với một tô Phở Bò Wagyu hay một ly cà phê đậm đà của nhà hàng thì sao nhỉ?" });

    // 2. Món ăn nổi bật & Menu
    data.push({ keywords: ["món tiêu biểu", "món hot", "best seller", "món nào ngon", "gợi ý món", "signature", "món đặc biệt", "nhà hàng có món gì ngon"], answer: "Dạ, món Signature của chúng tôi là <b>Phở Bò Wagyu</b> thượng hạng và <b>Set BBQ Hải Sản Nướng Đá</b>. Đảm bảo ăn một lần là nhớ mãi! 😍<br/><br/>👉 <a href='/menu' style='color: #e50914; font-weight: bold;'>Xem Menu VIP tại đây</a>" });
    data.push({ keywords: ["thực đơn", "menu", "các món", "bán gì", "có món gì", "đồ ăn", "cho xem menu", "xem thực đơn"], answer: "Thực đơn của chúng tôi rất đa dạng từ Khai vị, Món chính (Steak, BBQ, Hải sản) cho đến Tráng miệng và Đồ uống. 🍷<br/><br/>👉 <a href='/menu' style='color: #10b981; font-weight: bold;'>Truy cập Thực Đơn tại đây</a>" });
    data.push({ keywords: ["phở", "phở bò", "bún bò", "bún chả", "bún", "phở gà"], answer: "Nhắc đến các món nước, <b>Phở Bò Wagyu</b> và <b>Bún Chả Hà Nội</b> là 2 món có lượt tìm kiếm kỷ lục tại quán! Nước dùng hầm xương 24h ngọt thanh tự nhiên. 🍜<br/><br/>👉 <a href='/products' style='color: #007bff; font-weight: bold;'>Đặt ngay 1 tô nóng hổi!</a>" });
    data.push({ keywords: ["lẩu", "đồ nướng", "bbq", "buffet", "nướng", "thịt nướng", "hải sản nướng", "lẩu thái", "tomyum"], answer: "Bạn là fan của BBQ và Lẩu? Nhà hàng có ngay <b>Set Nướng Tảng Tứ Xuyên</b> và <b>Lẩu Thái Tomyum</b> chua cay bùng vị. 🥩🍲<br/><br/>👉 <a href='/products' style='color: #ff5722; font-weight: bold;'>Chốt đơn Set Lẩu Nướng tại đây</a>" });
    data.push({ keywords: ["pizza", "mì ý", "pasta", "đồ tây", "steak", "bò bít tết"], answer: "Bên cạnh đồ Việt, chúng tôi có phục vụ <b>Bò bít tết Striploin</b> nướng đá núi lửa và các loại <b>Mì Ý Hải Sản</b> sốt kem nấm chuẩn vị Âu! 🍝🥩" });
    data.push({ keywords: ["gà rán", "gà chiên", "gà nướng", "cánh gà"], answer: "Món <b>Gà rán sốt chua ngọt Hàn Quốc</b> giòn rụm bên ngoài, mọng nước bên trong đang cực kỳ đắt hàng. Trẻ em hay người lớn đều mê! 🍗" });
    data.push({ keywords: ["hải sản", "tôm", "cua", "mực", "ghẹ", "cá", "tôm hùm"], answer: "Hải sản tại nhà hàng luôn được nhập tươi sống mỗi ngày: Tôm hùm bỏ lò phô mai, Mực nướng sa tế, Cua sốt Singapore. 🦞🦀" });
    data.push({ keywords: ["sushi", "sashimi", "đồ nhật", "cá hồi"], answer: "Tuy là nhà hàng đa phong cách, nhưng set <b>Sashimi Cá Hồi Thượng Hạng</b> của chúng tôi được chính tay bếp trưởng người Nhật chế biến. Cực kỳ tươi ngon! 🍣" });
    data.push({ keywords: ["khai vị", "soup", "súp", "salad", "gỏi"], answer: "Để bắt đầu bữa tiệc, bạn có thể thử Súp Bào Ngư Vi Cá, Salad Bơ Ức Gà hoặc Gỏi Ngó Sen Tôm Thịt. Rất nhẹ nhàng và kích thích vị giác! 🥗" });

    // 3. Đồ uống & Tráng miệng
    data.push({ keywords: ["trà sữa", "nước uống", "đồ uống", "nước ép", "sinh tố", "cà phê", "cafe"], answer: "Quán có <b>Trà sữa Trân châu Đường đen Hokkaido</b>, Cà phê pha máy Ý, và đa dạng các loại nước ép trái cây tươi nhiệt đới mát lạnh. 🧋🥤" });
    data.push({ keywords: ["rượu", "bia", "rượu vang", "cocktail", "soju", "đồ có cồn"], answer: "Nhà hàng có quầy Bar phục vụ Cocktail pha chế tại bàn, tháp Bia tươi thủ công và tủ Rượu vang nhập khẩu từ Pháp, Ý, Chile. 🍷🍻" });
    data.push({ keywords: ["tráng miệng", "bánh ngọt", "kem", "chè", "hoa quả", "trái cây"], answer: "Để kết thúc bữa ăn hoàn hảo, hãy thử Bánh Tiramisu, Kem Gelato Ý 3 vị hoặc Chè Khúc Bạch thanh mát của nhà hàng nhé! 🍰🍧" });

    // 4. Chế độ ăn uống (Dietary & Allergy)
    data.push({ keywords: ["chay", "món chay", "ăn chay", "thuần chay", "vegan", "vegetarian"], answer: "Dạ nhà hàng có menu dành riêng cho người ăn chay (Vegetarian/Vegan). 🥗<br/><br/>👉 <a href='/menu?category=chay' style='color: #10b981; font-weight: bold;'>Xem Menu Chay Dinh Dưỡng</a>" });
    data.push({ keywords: ["dị ứng", "không hành", "không cay", "kiêng", "bị dị ứng", "không đậu phộng", "dị ứng hải sản"], answer: "Chúng tôi cực kỳ quan tâm đến sức khỏe thực khách. Nếu bạn dị ứng (hải sản, đậu phộng...) hoặc kiêng (không cay, không hành), vui lòng ghi chú vào đơn hàng, bếp trưởng sẽ chế biến riêng cho bạn! 👨‍🍳" });
    data.push({ keywords: ["gluten free", "không gluten", "ăn kiêng", "keto", "eat clean"], answer: "Nhà hàng có các tùy chọn món ăn Keto, Eat Clean và Gluten-free (Salad diêm mạch, Ức gà nướng áp chảo). Bạn hoàn toàn an tâm thưởng thức nhé!" });
    data.push({ keywords: ["trẻ em", "em bé", "baby", "kid menu", "đồ ăn cho bé", "cháo"], answer: "Chúng tôi có Kid Menu với các món cháo dinh dưỡng, súp gà ngô non, và khoai tây chiên tạo hình vui nhộn dành riêng cho các bé. 👶🍟" });

    // 5. Đặt bàn & Sự kiện
    data.push({ keywords: ["đặt bàn", "đặt chỗ", "book bàn", "đặt lịch", "giữ chỗ", "bàn trống", "muốn đặt bàn", "cần đặt bàn"], answer: "Để có vị trí ngồi đẹp, bạn hãy đặt bàn trước nhé. Có hỗ trợ trang trí sinh nhật! 🎂<br/><br/>👉 <a href='/booking' style='color: #f59e0b; font-weight: bold;'>Click Đặt Bàn Nhanh</a>" });
    data.push({ keywords: ["sinh nhật", "kỷ niệm", "hẹn hò", "trang trí", "party", "tiệc"], answer: "Nhà hàng nhận setup tiệc sinh nhật, kỷ niệm lãng mạn miễn phí (gồm hoa, nến và biển tên). Nếu đặt bàn trên 10 người, sẽ có tặng kèm bánh kem! 🎉" });
    data.push({ keywords: ["đông người", "công ty", "tất niên", "hội thảo", "liên hoan", "phòng riêng", "vip"], answer: "Nhà hàng có hệ thống phòng VIP cách âm (chứa từ 10 - 50 người) trang bị sẵn máy chiếu, dàn karaoke hiện đại rất phù hợp cho liên hoan công ty. 🎤" });
    data.push({ keywords: ["hủy bàn", "đổi giờ", "thay đổi lịch", "hủy đặt chỗ", "đến muộn"], answer: "Nếu bạn muốn hủy bàn hoặc đổi giờ, vui lòng gọi điện thoại trực tiếp cho hotline hoặc nhắn tin 'gặp nhân viên' để được hỗ trợ ngay lập tức nhé." });

    // 6. Giao hàng (Delivery & Takeaway)
    data.push({ keywords: ["ship", "giao hàng", "mang về", "giao tận nơi", "ship đồ", "take away", "đặt mang về", "có giao không"], answer: "Nhà hàng có dịch vụ Giao hàng tiêu chuẩn 5 sao. Freeship cho đơn hàng từ 500k trong bán kính 5km. 🛵<br/><br/>👉 <a href='/products' style='color: #ea580c; font-weight: bold;'>Đặt giao tận nơi ngay!</a>" });
    data.push({ keywords: ["bao lâu", "thời gian giao", "khi nào tới", "ship bao lâu", "đợi lâu không"], answer: "Thời gian giao hàng thường dao động từ 20 - 45 phút tùy thuộc vào khoảng cách và tình hình kẹt xe. Đồ ăn luôn được đóng gói giữ nhiệt cẩn thận! ⏰" });
    data.push({ keywords: ["phí ship", "tiền ship", "giá ship", "giao hàng bao nhiêu tiền"], answer: "Phí ship cơ bản là 20.000đ cho 3km đầu tiên, và 5.000đ cho mỗi km tiếp theo. Tuy nhiên, đơn hàng trên 500k sẽ được hoàn toàn FREESHIP! 💸" });
    data.push({ keywords: ["ứng dụng giao hàng", "shopeefood", "grab", "grabfood", "beamin", "gojek"], answer: "Ngoài đặt trực tiếp qua website, bạn cũng có thể tìm thấy chúng tôi trên các ứng dụng ShopeeFood, GrabFood, BeFood và Gojek với nhiều mã giảm giá riêng biệt." });

    // 7. Thanh toán & Hóa đơn
    data.push({ keywords: ["thanh toán", "chuyển khoản", "trả thẻ", "quẹt thẻ", "tiền mặt", "phương thức thanh toán"], answer: "Chúng tôi hỗ trợ đa dạng phương thức: Tiền mặt, Thẻ tín dụng/Ghi nợ, Chuyển khoản QR, Ví điện tử (Momo, ZaloPay, VNPay). 💳" });
    data.push({ keywords: ["xuất hóa đơn", "vat", "hóa đơn đỏ", "lấy hóa đơn"], answer: "Nhà hàng có hỗ trợ xuất hóa đơn VAT điện tử (8% hoặc 10% tùy món) ngay trong ngày. Bạn vui lòng cung cấp MST và Email cho nhân viên khi thanh toán." });
    data.push({ keywords: ["hoàn tiền", "refund", "hủy đơn", "trả lại tiền"], answer: "Đối với đơn hàng thanh toán trước, nếu bạn hủy đơn hợp lệ trước khi bếp chuẩn bị món, tiền sẽ được hoàn về tài khoản của bạn trong 24-48 giờ làm việc. 💰" });

    // 8. Khuyến mãi & Thành viên
    data.push({ keywords: ["khuyến mãi", "mã giảm giá", "voucher", "sale", "giảm giá", "coupon", "ưu đãi", "chương trình"], answer: "Tuyệt vời! Chúng tôi đang có giảm 20% cho thành viên mới và mua 1 tặng 1 đồ uống. 🎉<br/><br/>👉 <a href='/vouchers' style='color: #ef4444; font-weight: bold;'>Lấy Voucher Tại Đây</a>" });
    data.push({ keywords: ["thành viên", "tích điểm", "thẻ vip", "member", "đăng ký thành viên"], answer: "Chương trình Khách hàng thân thiết: Tích lũy 5% giá trị hóa đơn. Khi nâng hạng VIP/Platinum, bạn sẽ được giảm trực tiếp 10%-15% cho mọi hóa đơn vĩnh viễn! 👑" });

    // 9. Giờ giấc, Địa điểm & Tiện ích
    data.push({ keywords: ["giờ mở cửa", "thời gian", "mấy giờ mở", "mấy giờ đóng", "lúc nào mở", "đóng cửa chưa", "khi nào nghỉ"], answer: "Hệ thống nhà hàng mở cửa liên tục từ <b>08:00 sáng đến 23:00 tối</b> hàng ngày (kể cả Lễ Tết). Đặc biệt 18:00 - 20:00 có Live Music! 🎸" });
    data.push({ keywords: ["địa chỉ", "ở đâu", "địa điểm", "chỉ đường", "vị trí", "địa chỉ nhà hàng", "chi nhánh", "cơ sở"], answer: "Chúng tôi có các chi nhánh tại trung tâm. Không gian sang trọng, bãi đỗ ô tô miễn phí.<br/><br/>👉 <a href='/contact' style='color: #4f46e5; font-weight: bold;'>Xem bản đồ chi nhánh</a>" });
    data.push({ keywords: ["chỗ để xe", "đỗ xe", "ô tô", "bãi xe", "xe máy", "gửi xe"], answer: "Nhà hàng có bãi đỗ xe vô cùng rộng rãi ngay mặt tiền, có bảo vệ trông giữ 24/7. Hỗ trợ đỗ xe ô tô (cả xe 45 chỗ) hoàn toàn miễn phí! 🚗🏍️" });
    data.push({ keywords: ["wifi", "mạng", "mật khẩu wifi", "pass wifi"], answer: "Hệ thống Wifi miễn phí phủ sóng toàn nhà hàng. Tên Wifi: 'Nha Hang VIP', Mật khẩu: '12345678'. 📶" });
    data.push({ keywords: ["thú cưng", "chó", "mèo", "pet", "mang chó"], answer: "Rất hoan nghênh! Chúng tôi là nhà hàng Pet-friendly. Tuy nhiên bạn vui lòng giữ bé trong lồng hoặc rọ mõm để không ảnh hưởng đến thực khách khác nhé. 🐶😺" });
    data.push({ keywords: ["hút thuốc", "phòng hút thuốc", "smoking"], answer: "Nhà hàng quy định không hút thuốc trong phòng máy lạnh. Chúng tôi có bố trí khu vực ban công sân vườn (Outdoor) dành riêng cho khách hút thuốc. 🚬" });
    data.push({ keywords: ["dress code", "trang phục", "mặc đồ", "mặc gì"], answer: "Nhà hàng không có quy định quá khắt khe về trang phục (Dress code). Bạn có thể mặc đồ dạo phố lịch sự, thoải mái là được. Tuy nhiên xin tránh mặc đồ ngủ! 👗👔" });

    // 10. Liên hệ, Link website
    data.push({ keywords: ["link quán", "cho tôi link", "trang chủ", "website", "truy cập", "vào trang web", "link"], answer: "Dạ, đây là trang chủ chính thức của hệ thống nhà hàng chúng tôi: 🎁<br/><br/>👉 <a href='/' style='color: #3b82f6; font-weight: bold; font-size: 1.1em;'>Nhấn vào đây để về Trang Chủ</a>" });
    data.push({ keywords: ["số điện thoại", "sđt", "hotline", "gọi điện"], answer: "Hotline tổng đài CSKH của nhà hàng là: <b>1900 8888</b>. Cần hỗ trợ gấp bạn cứ gọi trực tiếp nhé! 📞" });
    data.push({ keywords: ["zalo", "facebook", "fanpage", "mạng xã hội", "tiktok"], answer: "Bạn có thể kết nối với chúng tôi qua Zalo OA, Facebook Fanpage hoặc TikTok để theo dõi các video ẩm thực thú vị nhé. Tìm tên 'Nhà Hàng VIP' là ra ngay!" });

    // 11. Hỗ trợ khẩn cấp, Khiếu nại (Gửi hòm thư)
    data.push({ keywords: ["gặp nhân viên", "nhân viên hỗ trợ", "nói chuyện với người", "gặp tư vấn viên", "admin", "tư vấn trực tiếp", "cần hỗ trợ", "giúp tôi", "help"], answer: "Dạ, yêu cầu hỗ trợ trực tiếp của bạn đã được tôi gửi vào hòm thư Admin. Nhân viên CSKH sẽ phản hồi bạn trong 1 phút nữa! ⚡", notifyAdmin: true });
    data.push({ keywords: ["khiếu nại", "phàn nàn", "bực mình", "tệ", "chậm", "dở", "thái độ", "không ngon", "đợi lâu", "báo cáo"], answer: "Tôi vô cùng xin lỗi vì trải nghiệm chưa tốt của bạn. Hệ thống đã lập tức ghi nhận phàn nàn này là **Mức Độ Ưu Tiên Cao Nhất** và báo trực tiếp cho Quản lý nhà hàng. Quản lý sẽ liên hệ xin lỗi và xử lý cho bạn ngay bây giờ!", notifyAdmin: true });
    data.push({ keywords: ["hợp tác", "đối tác", "quảng cáo", "marketing", "đầu tư", "mua sỉ", "nhượng quyền", "franchise"], answer: "Cảm ơn bạn đã quan tâm đến việc hợp tác. Vui lòng để lại Email và SĐT, hệ thống đã gửi yêu cầu này đến bộ phận Phát triển kinh doanh để liên hệ lại với bạn.", notifyAdmin: true });

    // Viết thêm một số biến thể ngắn gọn để tròn 40-50 nhóm chủ đề sâu
    data.push({ keywords: ["ngon", "đẹp", "xuất sắc", "đỉnh", "10 điểm", "tuyệt vời"], answer: "Cảm ơn lời khen của bạn! Đó là động lực to lớn để đội ngũ nhà hàng phục vụ tốt hơn mỗi ngày. 🥰" });
    data.push({ keywords: ["chán", "thất vọng", "không thích"], answer: "Tôi rất tiếc nếu món ăn chưa hợp khẩu vị của bạn. Xin bạn nán lại để quản lý có thể lắng nghe và đổi món khác cho bạn nhé!", notifyAdmin: true });
    data.push({ keywords: ["lạnh", "nóng", "điều hòa", "máy lạnh", "nhiệt độ"], answer: "Dạ, nếu bạn thấy nhiệt độ phòng chưa phù hợp, bạn hãy báo ngay bạn nhân viên phục vụ gần nhất để điều chỉnh điều hòa nhé!" });
    data.push({ keywords: ["ngồi ngoài", "sân vườn", "ban công", "view", "cảnh đẹp"], answer: "Nhà hàng có khu vực ban công cực chill ngắm view thành phố về đêm. Hãy ghi chú 'Thích ngồi ngoài' khi đặt bàn nhé! 🌃" });
    data.push({ keywords: ["ngồi trong", "trong nhà", "yên tĩnh"], answer: "Khu vực bên trong nhà hàng có máy lạnh mát mẻ, âm nhạc du dương và rất yên tĩnh, phù hợp cho các buổi gặp mặt đối tác." });

    const aiDataPath = path.join(__dirname, 'aiData.json');
    fs.writeFileSync(aiDataPath, JSON.stringify(data, null, 2));
    console.log(`Successfully generated ${data.length} deep trained intents to aiData.json!`);
};

generateData();
