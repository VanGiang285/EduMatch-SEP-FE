// Dữ liệu tỉnh thành và quận huyện Việt Nam (cập nhật 2024)
export interface District {
  code: string;
  name: string;
  type: string;
}

export interface Province {
  code: string;
  name: string;
  type: string;
  districts: District[];
}

export const vietnamProvinces: Province[] = [
  {
    code: "01",
    name: "Hà Nội",
    type: "Thành phố Trung ương",
    districts: [
      { code: "001", name: "Quận Ba Đình", type: "Quận" },
      { code: "002", name: "Quận Hoàn Kiếm", type: "Quận" },
      { code: "003", name: "Quận Tây Hồ", type: "Quận" },
      { code: "004", name: "Quận Long Biên", type: "Quận" },
      { code: "005", name: "Quận Cầu Giấy", type: "Quận" },
      { code: "006", name: "Quận Đống Đa", type: "Quận" },
      { code: "007", name: "Quận Hai Bà Trưng", type: "Quận" },
      { code: "008", name: "Quận Hoàng Mai", type: "Quận" },
      { code: "009", name: "Quận Thanh Xuân", type: "Quận" },
      { code: "016", name: "Huyện Sóc Sơn", type: "Huyện" },
      { code: "017", name: "Huyện Đông Anh", type: "Huyện" },
      { code: "018", name: "Huyện Gia Lâm", type: "Huyện" },
      { code: "019", name: "Quận Nam Từ Liêm", type: "Quận" },
      { code: "020", name: "Huyện Thanh Trì", type: "Huyện" },
      { code: "021", name: "Quận Bắc Từ Liêm", type: "Quận" },
      { code: "250", name: "Huyện Mê Linh", type: "Huyện" },
      { code: "268", name: "Quận Hà Đông", type: "Quận" },
      { code: "269", name: "Thị xã Sơn Tây", type: "Thị xã" },
      { code: "271", name: "Huyện Ba Vì", type: "Huyện" },
      { code: "272", name: "Huyện Phúc Thọ", type: "Huyện" },
      { code: "273", name: "Huyện Đan Phượng", type: "Huyện" },
      { code: "274", name: "Huyện Hoài Đức", type: "Huyện" },
      { code: "275", name: "Huyện Quốc Oai", type: "Huyện" },
      { code: "276", name: "Huyện Thạch Thất", type: "Huyện" },
      { code: "277", name: "Huyện Chương Mỹ", type: "Huyện" },
      { code: "278", name: "Huyện Thanh Oai", type: "Huyện" },
      { code: "279", name: "Huyện Thường Tín", type: "Huyện" },
      { code: "280", name: "Huyện Phú Xuyên", type: "Huyện" },
      { code: "281", name: "Huyện Ứng Hòa", type: "Huyện" },
      { code: "282", name: "Huyện Mỹ Đức", type: "Huyện" }
    ]
  },
  {
    code: "79",
    name: "Hồ Chí Minh",
    type: "Thành phố Trung ương",
    districts: [
      { code: "760", name: "Quận 1", type: "Quận" },
      { code: "761", name: "Quận 12", type: "Quận" },
      { code: "762", name: "Quận Thủ Đức", type: "Quận" },
      { code: "763", name: "Quận 9", type: "Quận" },
      { code: "764", name: "Quận Gò Vấp", type: "Quận" },
      { code: "765", name: "Quận Bình Thạnh", type: "Quận" },
      { code: "766", name: "Quận Tân Bình", type: "Quận" },
      { code: "767", name: "Quận Tân Phú", type: "Quận" },
      { code: "768", name: "Quận Phú Nhuận", type: "Quận" },
      { code: "769", name: "Quận 2", type: "Quận" },
      { code: "770", name: "Quận 3", type: "Quận" },
      { code: "771", name: "Quận 10", type: "Quận" },
      { code: "772", name: "Quận 11", type: "Quận" },
      { code: "773", name: "Quận 4", type: "Quận" },
      { code: "774", name: "Quận 5", type: "Quận" },
      { code: "775", name: "Quận 6", type: "Quận" },
      { code: "776", name: "Quận 8", type: "Quận" },
      { code: "777", name: "Quận Bình Tân", type: "Quận" },
      { code: "778", name: "Quận 7", type: "Quận" },
      { code: "783", name: "Huyện Củ Chi", type: "Huyện" },
      { code: "784", name: "Huyện Hóc Môn", type: "Huyện" },
      { code: "785", name: "Huyện Bình Chánh", type: "Huyện" },
      { code: "786", name: "Huyện Nhà Bè", type: "Huyện" },
      { code: "787", name: "Huyện Cần Giờ", type: "Huyện" }
    ]
  },
  {
    code: "48",
    name: "Đà Nẵng",
    type: "Thành phố Trung ương",
    districts: [
      { code: "490", name: "Quận Liên Chiểu", type: "Quận" },
      { code: "491", name: "Quận Thanh Khê", type: "Quận" },
      { code: "492", name: "Quận Hải Châu", type: "Quận" },
      { code: "493", name: "Quận Sơn Trà", type: "Quận" },
      { code: "494", name: "Quận Ngũ Hành Sơn", type: "Quận" },
      { code: "495", name: "Quận Cẩm Lệ", type: "Quận" },
      { code: "497", name: "Huyện Hòa Vang", type: "Huyện" },
      { code: "498", name: "Huyện Hoàng Sa", type: "Huyện" }
    ]
  },
  {
    code: "31",
    name: "Hải Phòng",
    type: "Thành phố Trung ương",
    districts: [
      { code: "303", name: "Quận Hồng Bàng", type: "Quận" },
      { code: "304", name: "Quận Ngô Quyền", type: "Quận" },
      { code: "305", name: "Quận Lê Chân", type: "Quận" },
      { code: "306", name: "Quận Hải An", type: "Quận" },
      { code: "307", name: "Quận Kiến An", type: "Quận" },
      { code: "308", name: "Quận Đồ Sơn", type: "Quận" },
      { code: "309", name: "Quận Dương Kinh", type: "Quận" },
      { code: "311", name: "Huyện Thuỷ Nguyên", type: "Huyện" },
      { code: "312", name: "Huyện An Dương", type: "Huyện" },
      { code: "313", name: "Huyện An Lão", type: "Huyện" },
      { code: "314", name: "Huyện Kiến Thuỵ", type: "Huyện" },
      { code: "315", name: "Huyện Tiên Lãng", type: "Huyện" },
      { code: "316", name: "Huyện Vĩnh Bảo", type: "Huyện" },
      { code: "317", name: "Huyện Cát Hải", type: "Huyện" },
      { code: "318", name: "Huyện Bạch Long Vĩ", type: "Huyện" }
    ]
  },
  {
    code: "92",
    name: "Cần Thơ",
    type: "Thành phố Trung ương",
    districts: [
      { code: "916", name: "Quận Ninh Kiều", type: "Quận" },
      { code: "917", name: "Quận Ô Môn", type: "Quận" },
      { code: "918", name: "Quận Bình Thuỷ", type: "Quận" },
      { code: "919", name: "Quận Cái Răng", type: "Quận" },
      { code: "923", name: "Quận Thốt Nốt", type: "Quận" },
      { code: "924", name: "Huyện Vĩnh Thạnh", type: "Huyện" },
      { code: "925", name: "Huyện Cờ Đỏ", type: "Huyện" },
      { code: "926", name: "Huyện Phong Điền", type: "Huyện" },
      { code: "927", name: "Huyện Thới Lai", type: "Huyện" }
    ]
  },
  {
    code: "75",
    name: "Đồng Nai",
    type: "Tỉnh",
    districts: [
      { code: "731", name: "Thành phố Biên Hòa", type: "Thành phố" },
      { code: "732", name: "Huyện Long Khánh", type: "Huyện" },
      { code: "734", name: "Huyện Tân Phú", type: "Huyện" },
      { code: "735", name: "Huyện Vĩnh Cửu", type: "Huyện" },
      { code: "736", name: "Huyện Định Quán", type: "Huyện" },
      { code: "737", name: "Huyện Trảng Bom", type: "Huyện" },
      { code: "738", name: "Huyện Thống Nhất", type: "Huyện" },
      { code: "739", name: "Huyện Cẩm Mỹ", type: "Huyện" },
      { code: "740", name: "Huyện Long Thành", type: "Huyện" },
      { code: "741", name: "Huyện Xuân Lộc", type: "Huyện" },
      { code: "742", name: "Huyện Nhơn Trạch", type: "Huyện" }
    ]
  },
  {
    code: "30",
    name: "Hải Dương",
    type: "Tỉnh",
    districts: [
      { code: "288", name: "Thành phố Hải Dương", type: "Thành phố" },
      { code: "290", name: "Thành phố Chí Linh", type: "Thành phố" },
      { code: "291", name: "Huyện Nam Sách", type: "Huyện" },
      { code: "292", name: "Huyện Kinh Môn", type: "Huyện" },
      { code: "293", name: "Huyện Kim Thành", type: "Huyện" },
      { code: "294", name: "Huyện Thanh Hà", type: "Huyện" },
      { code: "295", name: "Huyện Cẩm Giàng", type: "Huyện" },
      { code: "296", name: "Huyện Bình Giang", type: "Huyện" },
      { code: "297", name: "Huyện Gia Lộc", type: "Huyện" },
      { code: "298", name: "Huyện Tứ Kỳ", type: "Huyện" },
      { code: "299", name: "Huyện Ninh Giang", type: "Huyện" },
      { code: "300", name: "Huyện Thanh Miện", type: "Huyện" }
    ]
  },
  {
    code: "36",
    name: "Nam Định",
    type: "Tỉnh",
    districts: [
      { code: "342", name: "Thành phố Nam Định", type: "Thành phố" },
      { code: "344", name: "Huyện Mỹ Lộc", type: "Huyện" },
      { code: "345", name: "Huyện Vụ Bản", type: "Huyện" },
      { code: "346", name: "Huyện Ý Yên", type: "Huyện" },
      { code: "347", name: "Huyện Nghĩa Hưng", type: "Huyện" },
      { code: "348", name: "Huyện Nam Trực", type: "Huyện" },
      { code: "349", name: "Huyện Trực Ninh", type: "Huyện" },
      { code: "350", name: "Huyện Xuân Trường", type: "Huyện" },
      { code: "351", name: "Huyện Giao Thủy", type: "Huyện" },
      { code: "352", name: "Huyện Hải Hậu", type: "Huyện" }
    ]
  },
  {
    code: "52",
    name: "Bình Định",
    type: "Tỉnh",
    districts: [
      { code: "540", name: "Thành phố Quy Nhon", type: "Thành phố" },
      { code: "542", name: "Huyện An Lão", type: "Huyện" },
      { code: "543", name: "Thị xã Hoài Nhơn", type: "Thị xã" },
      { code: "544", name: "Huyện Hoài Ân", type: "Huyện" },
      { code: "545", name: "Huyện Phù Mỹ", type: "Huyện" },
      { code: "546", name: "Huyện Vĩnh Thạnh", type: "Huyện" },
      { code: "547", name: "Huyện Tây Sơn", type: "Huyện" },
      { code: "548", name: "Huyện Phù Cát", type: "Huyện" },
      { code: "549", name: "Thị xã An Nhơn", type: "Thị xã" },
      { code: "550", name: "Huyện Tuy Phước", type: "Huyện" },
      { code: "551", name: "Huyện Vân Canh", type: "Huyện" }
    ]
  },
  {
    code: "56",
    name: "Bình Thuận",
    type: "Tỉnh",
    districts: [
      { code: "593", name: "Thành phố Phan Thiết", type: "Thành phố" },
      { code: "594", name: "Thị xã La Gi", type: "Thị xã" },
      { code: "595", name: "Huyện Tuy Phong", type: "Huyện" },
      { code: "596", name: "Huyện Bắc Bình", type: "Huyện" },
      { code: "597", name: "Huyện Hàm Thuận Bắc", type: "Huyện" },
      { code: "598", name: "Huyện Hàm Thuận Nam", type: "Huyện" },
      { code: "599", name: "Huyện Tánh Linh", type: "Huyện" },
      { code: "600", name: "Huyện Đức Linh", type: "Huyện" },
      { code: "601", name: "Huyện Hàm Tân", type: "Huyện" },
      { code: "602", name: "Huyện Phú Quí", type: "Huyện" }
    ]
  },
  {
    code: "58",
    name: "Ninh Thuận",
    type: "Tỉnh",
    districts: [
      { code: "608", name: "Thành phố Phan Rang-Tháp Chàm", type: "Thành phố" },
      { code: "610", name: "Huyện Bác Ái", type: "Huyện" },
      { code: "611", name: "Huyện Ninh Sơn", type: "Huyện" },
      { code: "612", name: "Huyện Ninh Hải", type: "Huyện" },
      { code: "613", name: "Huyện Ninh Phước", type: "Huyện" },
      { code: "614", name: "Huyện Thuận Bắc", type: "Huyện" },
      { code: "615", name: "Huyện Thuận Nam", type: "Huyện" }
    ]
  },
  {
    code: "60",
    name: "Khánh Hòa",
    type: "Tỉnh",
    districts: [
      { code: "622", name: "Thành phố Nha Trang", type: "Thành phố" },
      { code: "623", name: "Thành phố Cam Ranh", type: "Thành phố" },
      { code: "624", name: "Huyện Cam Lâm", type: "Huyện" },
      { code: "625", name: "Huyện Vạn Ninh", type: "Huyện" },
      { code: "626", name: "Thị xã Ninh Hòa", type: "Thị xã" },
      { code: "627", name: "Huyện Khánh Vĩnh", type: "Huyện" },
      { code: "628", name: "Huyện Diên Khánh", type: "Huyện" },
      { code: "629", name: "Huyện Khánh Sơn", type: "Huyện" },
      { code: "630", name: "Huyện Trường Sa", type: "Huyện" }
    ]
  },
  {
    code: "62",
    name: "Phú Yên",
    type: "Tỉnh",
    districts: [
      { code: "632", name: "Thành phố Tuy Hòa", type: "Thành phố" },
      { code: "633", name: "Thị xã Sông Cầu", type: "Thị xã" },
      { code: "634", name: "Huyện Đồng Xuân", type: "Huyện" },
      { code: "635", name: "Huyện Tuy An", type: "Huyện" },
      { code: "636", name: "Huyện Sơn Hòa", type: "Huyện" },
      { code: "637", name: "Huyện Sông Hinh", type: "Huyện" },
      { code: "638", name: "Huyện Tây Hòa", type: "Huyện" },
      { code: "639", name: "Huyện Phú Hòa", type: "Huyện" },
      { code: "640", name: "Huyện Đông Hòa", type: "Huyện" }
    ]
  },
  {
    code: "64",
    name: "Kon Tum",
    type: "Tỉnh",
    districts: [
      { code: "643", name: "Thành phố Kon Tum", type: "Thành phố" },
      { code: "645", name: "Huyện Đắk Glei", type: "Huyện" },
      { code: "646", name: "Huyện Ngọc Hồi", type: "Huyện" },
      { code: "647", name: "Huyện Đắk Tô", type: "Huyện" },
      { code: "648", name: "Huyện Kon Plông", type: "Huyện" },
      { code: "649", name: "Huyện Kon Rẫy", type: "Huyện" },
      { code: "650", name: "Huyện Đắk Hà", type: "Huyện" },
      { code: "651", name: "Huyện Sa Thầy", type: "Huyện" },
      { code: "652", name: "Huyện Tu Mơ Rông", type: "Huyện" },
      { code: "653", name: "Huyện Ia H'Drai", type: "Huyện" }
    ]
  },
  {
    code: "66",
    name: "Gia Lai",
    type: "Tỉnh",
    districts: [
      { code: "660", name: "Thành phố Pleiku", type: "Thành phố" },
      { code: "661", name: "Thị xã An Khê", type: "Thị xã" },
      { code: "662", name: "Thị xã Ayun Pa", type: "Thị xã" },
      { code: "663", name: "Huyện KBang", type: "Huyện" },
      { code: "664", name: "Huyện Đăk Đoa", type: "Huyện" },
      { code: "665", name: "Huyện Chư Păh", type: "Huyện" },
      { code: "666", name: "Huyện Ia Grai", type: "Huyện" },
      { code: "667", name: "Huyện Mang Yang", type: "Huyện" },
      { code: "668", name: "Huyện Kông Chro", type: "Huyện" },
      { code: "669", name: "Huyện Đức Cơ", type: "Huyện" },
      { code: "670", name: "Huyện Chư Prông", type: "Huyện" },
      { code: "671", name: "Huyện Chư Sê", type: "Huyện" },
      { code: "672", name: "Huyện Đăk Pơ", type: "Huyện" },
      { code: "673", name: "Huyện Ia Pa", type: "Huyện" },
      { code: "674", name: "Huyện Krông Pa", type: "Huyện" },
      { code: "675", name: "Huyện Phú Thiện", type: "Huyện" },
      { code: "676", name: "Huyện Chư Pưh", type: "Huyện" }
    ]
  },
  {
    code: "68",
    name: "Đắk Lắk",
    type: "Tỉnh",
    districts: [
      { code: "672", name: "Thành phố Buôn Ma Thuột", type: "Thành phố" },
      { code: "673", name: "Thị xã Buôn Hồ", type: "Thị xã" },
      { code: "674", name: "Huyện Ea H'leo", type: "Huyện" },
      { code: "675", name: "Huyện Ea Súp", type: "Huyện" },
      { code: "676", name: "Huyện Buôn Đôn", type: "Huyện" },
      { code: "677", name: "Huyện Cư M'gar", type: "Huyện" },
      { code: "678", name: "Huyện Krông Búk", type: "Huyện" },
      { code: "679", name: "Huyện Krông Năng", type: "Huyện" },
      { code: "680", name: "Huyện Ea Kar", type: "Huyện" },
      { code: "681", name: "Huyện M'Đrắk", type: "Huyện" },
      { code: "682", name: "Huyện Krông Bông", type: "Huyện" },
      { code: "683", name: "Huyện Krông Pắc", type: "Huyện" },
      { code: "684", name: "Huyện Krông A Na", type: "Huyện" },
      { code: "685", name: "Huyện Lắk", type: "Huyện" },
      { code: "686", name: "Huyện Cư Kuin", type: "Huyện" }
    ]
  },
  {
    code: "70",
    name: "Đắk Nông",
    type: "Tỉnh",
    districts: [
      { code: "703", name: "Thành phố Gia Nghĩa", type: "Thành phố" },
      { code: "705", name: "Huyện Đăk Glong", type: "Huyện" },
      { code: "706", name: "Huyện Cư Jút", type: "Huyện" },
      { code: "707", name: "Huyện Đắk Mil", type: "Huyện" },
      { code: "708", name: "Huyện Krông Nô", type: "Huyện" },
      { code: "709", name: "Huyện Đắk Song", type: "Huyện" },
      { code: "710", name: "Huyện Đắk R'Lấp", type: "Huyện" },
      { code: "711", name: "Huyện Tuy Đức", type: "Huyện" }
    ]
  },
  {
    code: "72",
    name: "Lâm Đồng",
    type: "Tỉnh",
    districts: [
      { code: "731", name: "Thành phố Đà Lạt", type: "Thành phố" },
      { code: "732", name: "Thành phố Bảo Lộc", type: "Thành phố" },
      { code: "734", name: "Huyện Đam Rông", type: "Huyện" },
      { code: "735", name: "Huyện Lạc Dương", type: "Huyện" },
      { code: "736", name: "Huyện Lâm Hà", type: "Huyện" },
      { code: "737", name: "Huyện Đơn Dương", type: "Huyện" },
      { code: "738", name: "Huyện Đức Trọng", type: "Huyện" },
      { code: "739", name: "Huyện Di Linh", type: "Huyện" },
      { code: "740", name: "Huyện Bảo Lâm", type: "Huyện" },
      { code: "741", name: "Huyện Đạ Huoai", type: "Huyện" },
      { code: "742", name: "Huyện Đạ Tẻh", type: "Huyện" },
      { code: "743", name: "Huyện Cát Tiên", type: "Huyện" }
    ]
  },
  {
    code: "74",
    name: "Bình Phước",
    type: "Tỉnh",
    districts: [
      { code: "688", name: "Thành phố Đồng Xoài", type: "Thành phố" },
      { code: "689", name: "Thị xã Bình Long", type: "Thị xã" },
      { code: "690", name: "Thị xã Phước Long", type: "Thị xã" },
      { code: "691", name: "Huyện Bù Gia Mập", type: "Huyện" },
      { code: "692", name: "Huyện Lộc Ninh", type: "Huyện" },
      { code: "693", name: "Huyện Bù Đốp", type: "Huyện" },
      { code: "694", name: "Huyện Hớn Quản", type: "Huyện" },
      { code: "695", name: "Huyện Đồng Phú", type: "Huyện" },
      { code: "696", name: "Huyện Bù Đăng", type: "Huyện" },
      { code: "697", name: "Huyện Chơn Thành", type: "Huyện" },
      { code: "698", name: "Huyện Phú Riềng", type: "Huyện" }
    ]
  },
  {
    code: "77",
    name: "Bà Rịa - Vũng Tàu",
    type: "Tỉnh",
    districts: [
      { code: "747", name: "Thành phố Vũng Tàu", type: "Thành phố" },
      { code: "748", name: "Thành phố Bà Rịa", type: "Thành phố" },
      { code: "750", name: "Huyện Châu Đức", type: "Huyện" },
      { code: "751", name: "Huyện Xuyên Mộc", type: "Huyện" },
      { code: "752", name: "Huyện Long Điền", type: "Huyện" },
      { code: "753", name: "Huyện Đất Đỏ", type: "Huyện" },
      { code: "754", name: "Thị xã Phú Mỹ", type: "Thị xã" },
      { code: "755", name: "Huyện Côn Đảo", type: "Huyện" }
    ]
  },
  {
    code: "89",
    name: "An Giang",
    type: "Tỉnh",
    districts: [
      { code: "883", name: "Thành phố Long Xuyên", type: "Thành phố" },
      { code: "884", name: "Thành phố Châu Đốc", type: "Thành phố" },
      { code: "886", name: "Huyện An Phú", type: "Huyện" },
      { code: "887", name: "Thị xã Tân Châu", type: "Thị xã" },
      { code: "888", name: "Huyện Phú Tân", type: "Huyện" },
      { code: "889", name: "Huyện Châu Phú", type: "Huyện" },
      { code: "890", name: "Huyện Tịnh Biên", type: "Huyện" },
      { code: "891", name: "Huyện Tri Tôn", type: "Huyện" },
      { code: "892", name: "Huyện Châu Thành", type: "Huyện" },
      { code: "893", name: "Huyện Chợ Mới", type: "Huyện" },
      { code: "894", name: "Huyện Thoại Sơn", type: "Huyện" }
    ]
  },
  {
    code: "91",
    name: "Kiên Giang",
    type: "Tỉnh",
    districts: [
      { code: "899", name: "Thành phố Rạch Giá", type: "Thành phố" },
      { code: "900", name: "Thành phố Hà Tiên", type: "Thành phố" },
      { code: "902", name: "Huyện Kiên Lương", type: "Huyện" },
      { code: "903", name: "Huyện Hòn Đất", type: "Huyện" },
      { code: "904", name: "Huyện Tân Hiệp", type: "Huyện" },
      { code: "905", name: "Huyện Châu Thành", type: "Huyện" },
      { code: "906", name: "Huyện Giồng Riềng", type: "Huyện" },
      { code: "907", name: "Huyện Gò Quao", type: "Huyện" },
      { code: "908", name: "Huyện An Biên", type: "Huyện" },
      { code: "909", name: "Huyện An Minh", type: "Huyện" },
      { code: "910", name: "Huyện Vĩnh Thuận", type: "Huyện" },
      { code: "911", name: "Huyện Phú Quốc", type: "Huyện" },
      { code: "912", name: "Huyện Kiên Hải", type: "Huyện" },
      { code: "913", name: "Huyện U Minh Thượng", type: "Huyện" },
      { code: "914", name: "Huyện Giang Thành", type: "Huyện" }
    ]
  },
  {
    code: "93",
    name: "Hậu Giang",
    type: "Tỉnh",
    districts: [
      { code: "930", name: "Thành phố Vị Thanh", type: "Thành phố" },
      { code: "931", name: "Thành phố Ngã Bảy", type: "Thành phố" },
      { code: "932", name: "Huyện Châu Thành A", type: "Huyện" },
      { code: "933", name: "Huyện Châu Thành", type: "Huyện" },
      { code: "934", name: "Huyện Phụng Hiệp", type: "Huyện" },
      { code: "935", name: "Huyện Vị Thủy", type: "Huyện" },
      { code: "936", name: "Huyện Long Mỹ", type: "Huyện" },
      { code: "937", name: "Thị xã Long Mỹ", type: "Thị xã" }
    ]
  },
  {
    code: "94",
    name: "Sóc Trăng",
    type: "Tỉnh",
    districts: [
      { code: "941", name: "Thành phố Sóc Trăng", type: "Thành phố" },
      { code: "943", name: "Huyện Châu Thành", type: "Huyện" },
      { code: "944", name: "Huyện Kế Sách", type: "Huyện" },
      { code: "945", name: "Huyện Mỹ Tú", type: "Huyện" },
      { code: "946", name: "Huyện Cù Lao Dung", type: "Huyện" },
      { code: "947", name: "Huyện Long Phú", type: "Huyện" },
      { code: "948", name: "Huyện Mỹ Xuyên", type: "Huyện" },
      { code: "949", name: "Thị xã Ngã Năm", type: "Thị xã" },
      { code: "950", name: "Huyện Thạnh Trị", type: "Huyện" },
      { code: "951", name: "Thị xã Vĩnh Châu", type: "Thị xã" },
      { code: "952", name: "Huyện Trần Đề", type: "Huyện" }
    ]
  },
  {
    code: "95",
    name: "Bạc Liêu",
    type: "Tỉnh",
    districts: [
      { code: "954", name: "Thành phố Bạc Liêu", type: "Thành phố" },
      { code: "956", name: "Huyện Hồng Dân", type: "Huyện" },
      { code: "957", name: "Huyện Phước Long", type: "Huyện" },
      { code: "958", name: "Huyện Vĩnh Lợi", type: "Huyện" },
      { code: "959", name: "Thị xã Giá Rai", type: "Thị xã" },
      { code: "960", name: "Huyện Đông Hải", type: "Huyện" },
      { code: "961", name: "Huyện Hoà Bình", type: "Huyện" }
    ]
  },
  {
    code: "96",
    name: "Cà Mau",
    type: "Tỉnh",
    districts: [
      { code: "964", name: "Thành phố Cà Mau", type: "Thành phố" },
      { code: "966", name: "Huyện U Minh", type: "Huyện" },
      { code: "967", name: "Huyện Thới Bình", type: "Huyện" },
      { code: "968", name: "Huyện Trần Văn Thời", type: "Huyện" },
      { code: "969", name: "Huyện Cái Nước", type: "Huyện" },
      { code: "970", name: "Huyện Đầm Dơi", type: "Huyện" },
      { code: "971", name: "Huyện Năm Căn", type: "Huyện" },
      { code: "972", name: "Huyện Phú Tân", type: "Huyện" },
      { code: "973", name: "Huyện Ngọc Hiển", type: "Huyện" }
    ]
  },
  {
    code: "02",
    name: "Hà Giang",
    type: "Tỉnh",
    districts: [
      { code: "024", name: "Thành phố Hà Giang", type: "Thành phố" },
      { code: "026", name: "Huyện Đồng Văn", type: "Huyện" },
      { code: "027", name: "Huyện Mèo Vạc", type: "Huyện" },
      { code: "028", name: "Huyện Yên Minh", type: "Huyện" },
      { code: "029", name: "Huyện Quản Bạ", type: "Huyện" },
      { code: "030", name: "Huyện Vị Xuyên", type: "Huyện" },
      { code: "031", name: "Huyện Bắc Mê", type: "Huyện" },
      { code: "032", name: "Huyện Hoàng Su Phì", type: "Huyện" },
      { code: "033", name: "Huyện Xín Mần", type: "Huyện" },
      { code: "034", name: "Huyện Bắc Quang", type: "Huyện" },
      { code: "035", name: "Huyện Quang Bình", type: "Huyện" }
    ]
  },
  {
    code: "04",
    name: "Cao Bằng",
    type: "Tỉnh",
    districts: [
      { code: "040", name: "Thành phố Cao Bằng", type: "Thành phố" },
      { code: "042", name: "Huyện Bảo Lâm", type: "Huyện" },
      { code: "043", name: "Huyện Bảo Lạc", type: "Huyện" },
      { code: "045", name: "Huyện Hà Quảng", type: "Huyện" },
      { code: "047", name: "Huyện Trùng Khánh", type: "Huyện" },
      { code: "048", name: "Huyện Hạ Lang", type: "Huyện" },
      { code: "049", name: "Huyện Quảng Hòa", type: "Huyện" },
      { code: "051", name: "Huyện Hoà An", type: "Huyện" },
      { code: "052", name: "Huyện Nguyên Bình", type: "Huyện" },
      { code: "053", name: "Huyện Thạch An", type: "Huyện" }
    ]
  },
  {
    code: "06",
    name: "Bắc Kạn",
    type: "Tỉnh",
    districts: [
      { code: "058", name: "Thành phố Bắc Kạn", type: "Thành phố" },
      { code: "060", name: "Huyện Pác Nặm", type: "Huyện" },
      { code: "061", name: "Huyện Ba Bể", type: "Huyện" },
      { code: "062", name: "Huyện Ngân Sơn", type: "Huyện" },
      { code: "063", name: "Huyện Bạch Thông", type: "Huyện" },
      { code: "064", name: "Huyện Chợ Đồn", type: "Huyện" },
      { code: "065", name: "Huyện Chợ Mới", type: "Huyện" },
      { code: "066", name: "Huyện Na Rì", type: "Huyện" }
    ]
  },
  {
    code: "08",
    name: "Tuyên Quang",
    type: "Tỉnh",
    districts: [
      { code: "070", name: "Thành phố Tuyên Quang", type: "Thành phố" },
      { code: "071", name: "Huyện Lâm Bình", type: "Huyện" },
      { code: "072", name: "Huyện Na Hang", type: "Huyện" },
      { code: "073", name: "Huyện Chiêm Hóa", type: "Huyện" },
      { code: "074", name: "Huyện Hàm Yên", type: "Huyện" },
      { code: "075", name: "Huyện Yên Sơn", type: "Huyện" },
      { code: "076", name: "Huyện Sơn Dương", type: "Huyện" }
    ]
  },
  {
    code: "10",
    name: "Lào Cai",
    type: "Tỉnh",
    districts: [
      { code: "080", name: "Thành phố Lào Cai", type: "Thành phố" },
      { code: "082", name: "Huyện Bát Xát", type: "Huyện" },
      { code: "083", name: "Huyện Mường Khương", type: "Huyện" },
      { code: "084", name: "Huyện Si Ma Cai", type: "Huyện" },
      { code: "085", name: "Huyện Bắc Hà", type: "Huyện" },
      { code: "086", name: "Huyện Bảo Thắng", type: "Huyện" },
      { code: "087", name: "Huyện Bảo Yên", type: "Huyện" },
      { code: "088", name: "Thị xã Sa Pa", type: "Thị xã" },
      { code: "089", name: "Huyện Văn Bàn", type: "Huyện" }
    ]
  },
  {
    code: "11",
    name: "Điện Biên",
    type: "Tỉnh",
    districts: [
      { code: "094", name: "Thành phố Điện Biên Phủ", type: "Thành phố" },
      { code: "095", name: "Thị xã Mường Lay", type: "Thị xã" },
      { code: "096", name: "Huyện Mường Nhé", type: "Huyện" },
      { code: "097", name: "Huyện Mường Chà", type: "Huyện" },
      { code: "098", name: "Huyện Tủa Chùa", type: "Huyện" },
      { code: "099", name: "Huyện Tuần Giáo", type: "Huyện" },
      { code: "100", name: "Huyện Điện Biên", type: "Huyện" },
      { code: "101", name: "Huyện Điện Biên Đông", type: "Huyện" },
      { code: "102", name: "Huyện Mường Ảng", type: "Huyện" },
      { code: "103", name: "Huyện Nậm Pồ", type: "Huyện" }
    ]
  },
  {
    code: "12",
    name: "Lai Châu",
    type: "Tỉnh",
    districts: [
      { code: "105", name: "Thành phố Lai Châu", type: "Thành phố" },
      { code: "106", name: "Huyện Tam Đường", type: "Huyện" },
      { code: "107", name: "Huyện Mường Tè", type: "Huyện" },
      { code: "108", name: "Huyện Sìn Hồ", type: "Huyện" },
      { code: "109", name: "Huyện Phong Thổ", type: "Huyện" },
      { code: "110", name: "Huyện Than Uyên", type: "Huyện" },
      { code: "111", name: "Huyện Tân Uyên", type: "Huyện" },
      { code: "112", name: "Huyện Nậm Nhùn", type: "Huyện" }
    ]
  },
  {
    code: "14",
    name: "Sơn La",
    type: "Tỉnh",
    districts: [
      { code: "116", name: "Thành phố Sơn La", type: "Thành phố" },
      { code: "118", name: "Huyện Quỳnh Nhai", type: "Huyện" },
      { code: "119", name: "Huyện Thuận Châu", type: "Huyện" },
      { code: "120", name: "Huyện Mường La", type: "Huyện" },
      { code: "121", name: "Huyện Bắc Yên", type: "Huyện" },
      { code: "122", name: "Huyện Phù Yên", type: "Huyện" },
      { code: "123", name: "Huyện Mộc Châu", type: "Huyện" },
      { code: "124", name: "Huyện Yên Châu", type: "Huyện" },
      { code: "125", name: "Huyện Mai Sơn", type: "Huyện" },
      { code: "126", name: "Huyện Sông Mã", type: "Huyện" },
      { code: "127", name: "Huyện Sốp Cộp", type: "Huyện" },
      { code: "128", name: "Huyện Vân Hồ", type: "Huyện" }
    ]
  },
  {
    code: "15",
    name: "Yên Bái",
    type: "Tỉnh",
    districts: [
      { code: "132", name: "Thành phố Yên Bái", type: "Thành phố" },
      { code: "133", name: "Thị xã Nghĩa Lộ", type: "Thị xã" },
      { code: "135", name: "Huyện Lục Yên", type: "Huyện" },
      { code: "136", name: "Huyện Văn Yên", type: "Huyện" },
      { code: "137", name: "Huyện Mù Cang Chải", type: "Huyện" },
      { code: "138", name: "Huyện Trấn Yên", type: "Huyện" },
      { code: "139", name: "Huyện Trạm Tấu", type: "Huyện" },
      { code: "140", name: "Huyện Văn Chấn", type: "Huyện" },
      { code: "141", name: "Huyện Yên Bình", type: "Huyện" }
    ]
  },
  {
    code: "17",
    name: "Hoà Bình",
    type: "Tỉnh",
    districts: [
      { code: "148", name: "Thành phố Hòa Bình", type: "Thành phố" },
      { code: "150", name: "Huyện Đà Bắc", type: "Huyện" },
      { code: "152", name: "Huyện Lương Sơn", type: "Huyện" },
      { code: "153", name: "Huyện Kim Bôi", type: "Huyện" },
      { code: "154", name: "Huyện Cao Phong", type: "Huyện" },
      { code: "155", name: "Huyện Tân Lạc", type: "Huyện" },
      { code: "156", name: "Huyện Mai Châu", type: "Huyện" },
      { code: "157", name: "Huyện Lạc Sơn", type: "Huyện" },
      { code: "158", name: "Huyện Yên Thủy", type: "Huyện" },
      { code: "159", name: "Huyện Lạc Thủy", type: "Huyện" }
    ]
  },
  {
    code: "19",
    name: "Thái Nguyên",
    type: "Tỉnh",
    districts: [
      { code: "164", name: "Thành phố Thái Nguyên", type: "Thành phố" },
      { code: "165", name: "Thành phố Sông Công", type: "Thành phố" },
      { code: "167", name: "Huyện Định Hóa", type: "Huyện" },
      { code: "168", name: "Huyện Phú Lương", type: "Huyện" },
      { code: "169", name: "Huyện Đồng Hỷ", type: "Huyện" },
      { code: "170", name: "Huyện Võ Nhai", type: "Huyện" },
      { code: "171", name: "Huyện Đại Từ", type: "Huyện" },
      { code: "172", name: "Thị xã Phổ Yên", type: "Thị xã" },
      { code: "173", name: "Huyện Phú Bình", type: "Huyện" }
    ]
  },
  {
    code: "20",
    name: "Lạng Sơn",
    type: "Tỉnh",
    districts: [
      { code: "178", name: "Thành phố Lạng Sơn", type: "Thành phố" },
      { code: "180", name: "Huyện Tràng Định", type: "Huyện" },
      { code: "181", name: "Huyện Bình Gia", type: "Huyện" },
      { code: "182", name: "Huyện Văn Lãng", type: "Huyện" },
      { code: "183", name: "Huyện Cao Lộc", type: "Huyện" },
      { code: "184", name: "Huyện Văn Quan", type: "Huyện" },
      { code: "185", name: "Huyện Bắc Sơn", type: "Huyện" },
      { code: "186", name: "Huyện Hữu Lũng", type: "Huyện" },
      { code: "187", name: "Huyện Chi Lăng", type: "Huyện" },
      { code: "188", name: "Huyện Lộc Bình", type: "Huyện" },
      { code: "189", name: "Huyện Đình Lập", type: "Huyện" }
    ]
  },
  {
    code: "22",
    name: "Quảng Ninh",
    type: "Tỉnh",
    districts: [
      { code: "193", name: "Thành phố Hạ Long", type: "Thành phố" },
      { code: "194", name: "Thành phố Móng Cái", type: "Thành phố" },
      { code: "195", name: "Thành phố Cẩm Phả", type: "Thành phố" },
      { code: "196", name: "Thành phố Uông Bí", type: "Thành phố" },
      { code: "198", name: "Huyện Bình Liêu", type: "Huyện" },
      { code: "199", name: "Huyện Tiên Yên", type: "Huyện" },
      { code: "200", name: "Huyện Đầm Hà", type: "Huyện" },
      { code: "201", name: "Huyện Hải Hà", type: "Huyện" },
      { code: "202", name: "Huyện Ba Chẽ", type: "Huyện" },
      { code: "203", name: "Huyện Vân Đồn", type: "Huyện" },
      { code: "205", name: "Thị xã Đông Triều", type: "Thị xã" },
      { code: "206", name: "Thị xã Quảng Yên", type: "Thị xã" },
      { code: "207", name: "Huyện Cô Tô", type: "Huyện" }
    ]
  },
  {
    code: "24",
    name: "Bắc Giang",
    type: "Tỉnh",
    districts: [
      { code: "213", name: "Thành phố Bắc Giang", type: "Thành phố" },
      { code: "215", name: "Huyện Yên Thế", type: "Huyện" },
      { code: "216", name: "Huyện Tân Yên", type: "Huyện" },
      { code: "217", name: "Huyện Lạng Giang", type: "Huyện" },
      { code: "218", name: "Huyện Lục Nam", type: "Huyện" },
      { code: "219", name: "Huyện Lục Ngạn", type: "Huyện" },
      { code: "220", name: "Huyện Sơn Động", type: "Huyện" },
      { code: "221", name: "Huyện Yên Dũng", type: "Huyện" },
      { code: "222", name: "Huyện Việt Yên", type: "Huyện" },
      { code: "223", name: "Huyện Hiệp Hòa", type: "Huyện" }
    ]
  },
  {
    code: "25",
    name: "Phú Thọ",
    type: "Tỉnh",
    districts: [
      { code: "227", name: "Thành phố Việt Trì", type: "Thành phố" },
      { code: "228", name: "Thị xã Phú Thọ", type: "Thị xã" },
      { code: "230", name: "Huyện Đoan Hùng", type: "Huyện" },
      { code: "231", name: "Huyện Hạ Hoà", type: "Huyện" },
      { code: "232", name: "Huyện Thanh Ba", type: "Huyện" },
      { code: "233", name: "Huyện Phù Ninh", type: "Huyện" },
      { code: "234", name: "Huyện Yên Lập", type: "Huyện" },
      { code: "235", name: "Huyện Cẩm Khê", type: "Huyện" },
      { code: "236", name: "Huyện Tam Nông", type: "Huyện" },
      { code: "237", name: "Huyện Lâm Thao", type: "Huyện" },
      { code: "238", name: "Huyện Thanh Sơn", type: "Huyện" },
      { code: "239", name: "Huyện Thanh Thuỷ", type: "Huyện" },
      { code: "240", name: "Huyện Tân Sơn", type: "Huyện" }
    ]
  },
  {
    code: "26",
    name: "Vĩnh Phúc",
    type: "Tỉnh",
    districts: [
      { code: "243", name: "Thành phố Vĩnh Yên", type: "Thành phố" },
      { code: "244", name: "Thành phố Phúc Yên", type: "Thành phố" },
      { code: "246", name: "Huyện Lập Thạch", type: "Huyện" },
      { code: "247", name: "Huyện Tam Dương", type: "Huyện" },
      { code: "248", name: "Huyện Tam Đảo", type: "Huyện" },
      { code: "249", name: "Huyện Bình Xuyên", type: "Huyện" },
      { code: "251", name: "Huyện Yên Lạc", type: "Huyện" },
      { code: "252", name: "Huyện Vĩnh Tường", type: "Huyện" },
      { code: "253", name: "Huyện Sông Lô", type: "Huyện" }
    ]
  },
  {
    code: "27",
    name: "Bắc Ninh",
    type: "Tỉnh",
    districts: [
      { code: "256", name: "Thành phố Bắc Ninh", type: "Thành phố" },
      { code: "258", name: "Huyện Yên Phong", type: "Huyện" },
      { code: "259", name: "Huyện Quế Võ", type: "Huyện" },
      { code: "260", name: "Huyện Tiên Du", type: "Huyện" },
      { code: "261", name: "Thị xã Từ Sơn", type: "Thị xã" },
      { code: "262", name: "Huyện Thuận Thành", type: "Huyện" },
      { code: "263", name: "Huyện Gia Bình", type: "Huyện" },
      { code: "264", name: "Huyện Lương Tài", type: "Huyện" }
    ]
  },
  {
    code: "33",
    name: "Hưng Yên",
    type: "Tỉnh",
    districts: [
      { code: "323", name: "Thành phố Hưng Yên", type: "Thành phố" },
      { code: "325", name: "Huyện Văn Lâm", type: "Huyện" },
      { code: "326", name: "Huyện Văn Giang", type: "Huyện" },
      { code: "327", name: "Huyện Yên Mỹ", type: "Huyện" },
      { code: "328", name: "Thị xã Mỹ Hào", type: "Thị xã" },
      { code: "329", name: "Huyện Ân Thi", type: "Huyện" },
      { code: "330", name: "Huyện Khoái Châu", type: "Huyện" },
      { code: "331", name: "Huyện Kim Động", type: "Huyện" },
      { code: "332", name: "Huyện Tiên Lữ", type: "Huyện" },
      { code: "333", name: "Huyện Phù Cừ", type: "Huyện" }
    ]
  },
  {
    code: "34",
    name: "Thái Bình",
    type: "Tỉnh",
    districts: [
      { code: "336", name: "Thành phố Thái Bình", type: "Thành phố" },
      { code: "338", name: "Huyện Quỳnh Phụ", type: "Huyện" },
      { code: "339", name: "Huyện Hưng Hà", type: "Huyện" },
      { code: "340", name: "Huyện Đông Hưng", type: "Huyện" },
      { code: "341", name: "Huyện Thái Thụy", type: "Huyện" },
      { code: "342", name: "Huyện Tiền Hải", type: "Huyện" },
      { code: "343", name: "Huyện Kiến Xương", type: "Huyện" },
      { code: "344", name: "Huyện Vũ Thư", type: "Huyện" }
    ]
  },
  {
    code: "35",
    name: "Hà Nam",
    type: "Tỉnh",
    districts: [
      { code: "347", name: "Thành phố Phủ Lý", type: "Thành phố" },
      { code: "349", name: "Thị xã Duy Tiên", type: "Thị xã" },
      { code: "350", name: "Huyện Kim Bảng", type: "Huyện" },
      { code: "351", name: "Huyện Thanh Liêm", type: "Huyện" },
      { code: "352", name: "Huyện Bình Lục", type: "Huyện" },
      { code: "353", name: "Huyện Lý Nhân", type: "Huyện" }
    ]
  }
];

// Helper functions
export const getProvinces = () => vietnamProvinces.map(province => ({
  code: province.code,
  name: province.name,
  type: province.type
}));

export const getDistrictsByProvince = (provinceCode: string) => {
  const province = vietnamProvinces.find(p => p.code === provinceCode);
  return province ? province.districts : [];
};

export const getProvinceByCode = (provinceCode: string) => {
  return vietnamProvinces.find(p => p.code === provinceCode);
};

export const getDistrictByCode = (provinceCode: string, districtCode: string) => {
  const province = getProvinceByCode(provinceCode);
  if (!province) return null;
  return province.districts.find(d => d.code === districtCode);
};
