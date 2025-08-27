-- Down Under Chauffeur Database Seed Data

-- Super Admin User
INSERT INTO users (id, name, email, email_verified, role, banned, created_at, updated_at) VALUES ('e4x48a0dao4da56ti3bnt7ig', 'Super Admin', 'admin@admin.com', 1, 'super_admin', 0, 1756281758, 1756281758);
INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('okod7mdkrgy0d8y3w0zji0o6', 'admin@admin.com', 'credential', 'e4x48a0dao4da56ti3bnt7ig', '3U2VDePWHtwb8sziRTklcOLGvSS771PfqGRMb7TZZKJai4nmJx3tj8kf+WzUozpI', 1756281758, 1756281758);

-- Car Brands
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('hgdgotot1cte06grhxdbuwnw', 'Mercedes-Benz', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('p9t3r3rat2m1r3ewzxpxeia9', 'BMW', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('qu15z5wbuk345h8lneugnmen', 'Audi', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('t9s9ftnnziff5stutu9ov1a4', 'Lexus', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('xridfglnfmufdxx05ootdinf', 'Porsche', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('mee7coymmvcdptgarcfu29p4', 'Jaguar', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('yhwcgzkvkumcep5jcqb43mcp', 'Land Rover', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('wn1f1qqmtwmn6bcybx2sdgkw', 'Tesla', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('np8kd29jztfnopgyafn7q6u2', 'Bentley', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('fo3n5kp598h2xyqyl2cs59nc', 'Rolls-Royce', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('mfa4cbrbjp3qu9mw9rxebfqn', 'Maserati', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('spe5r06uhhabhu62hzg9z4cg', 'Ferrari', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('tda3lqgsfwm4fm28cx609gg8', 'Lamborghini', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('r3lgtd59hkuptif0bllucr47', 'McLaren', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('ooor3ix7v21pqhvblsn7bjup', 'Aston Martin', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('au3bi8uberqkgvqyrux8znxy', 'Cadillac', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('pnypnc9xittf0akbkkd9zgkk', 'Genesis', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('wwi7u3218l8le15rjmo5llsn', 'Volvo', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('la1wc9w1ifehrgj2crvmrkus', 'Range Rover', 1756281758, 1756281758);
INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('w6philmr2obvexbon2geq03u', 'Chrysler', 1756281758, 1756281758);

-- Car Models
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('o5fepv7fipyjm9b44170123o', 'S-Class', 'hgdgotot1cte06grhxdbuwnw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('zqnniqdpebgad4g665x8qlh8', 'E-Class', 'hgdgotot1cte06grhxdbuwnw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('ezk2yvhvyfmqagyzdk0rvfgb', 'GLS-Class', 'hgdgotot1cte06grhxdbuwnw', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('jnbm9c5u9nc97vns54n4vd42', 'G-Class', 'hgdgotot1cte06grhxdbuwnw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('f21fwx4dpg1cpf98qxdjixog', 'Maybach S-Class', 'hgdgotot1cte06grhxdbuwnw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('qobitzshyc254ct9q8t8k0un', 'AMG GT', 'hgdgotot1cte06grhxdbuwnw', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('i0f1vf79wavo66pg8umzxlev', 'Sprinter', 'hgdgotot1cte06grhxdbuwnw', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('udpic44edjuji7m4andzptml', '7 Series', 'p9t3r3rat2m1r3ewzxpxeia9', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('fmzqf9p71rml1f9pzvb9wgb3', '5 Series', 'p9t3r3rat2m1r3ewzxpxeia9', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('r0arqsmpetpt4egzkgrl5h0l', 'X7', 'p9t3r3rat2m1r3ewzxpxeia9', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('r85q9a8hnvi9xzrtd6ig4idv', 'X5', 'p9t3r3rat2m1r3ewzxpxeia9', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('yqc2s9qn24gqoch78jjyqdfk', 'i7', 'p9t3r3rat2m1r3ewzxpxeia9', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('w2vem25852ge22ebn36hbu0n', 'M8', 'p9t3r3rat2m1r3ewzxpxeia9', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('v5nu6m0rjdigbkk2rbt4ij4i', 'A8', 'qu15z5wbuk345h8lneugnmen', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('zbdmzrtwlg68sseh4cn8ci2j', 'A6', 'qu15z5wbuk345h8lneugnmen', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('n0niygbif33d0aozvkpqfmix', 'Q8', 'qu15z5wbuk345h8lneugnmen', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('edca3s9z5f74xgn3unzkilei', 'Q7', 'qu15z5wbuk345h8lneugnmen', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('jexe70bvb2qh006gj9fpkbhg', 'e-tron GT', 'qu15z5wbuk345h8lneugnmen', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('rq9dkfzcy68vb4ymb477l1zt', 'R8', 'qu15z5wbuk345h8lneugnmen', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('gb6coin004lus9dxqzdofcw5', 'LS', 't9s9ftnnziff5stutu9ov1a4', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('gs3l9pth5wns8tof9fk1nm1b', 'LX', 't9s9ftnnziff5stutu9ov1a4', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('a37o5zmx5zoa3qvh6r2yy2me', 'GX', 't9s9ftnnziff5stutu9ov1a4', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('uaysyjpuyxa66ma5o0nu45on', 'ES', 't9s9ftnnziff5stutu9ov1a4', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('lp6l29oenm1391had9d3qa32', 'LC', 't9s9ftnnziff5stutu9ov1a4', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('fc7rkvfsgieyaag00c2nyoj8', 'Panamera', 'xridfglnfmufdxx05ootdinf', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('m9fj7p1ox9gmzhnndwk0szk9', 'Cayenne', 'xridfglnfmufdxx05ootdinf', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('yoeapwv7foofkh4kv8m820oc', '911', 'xridfglnfmufdxx05ootdinf', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('qg7cbaajjzavtt8uav8yma8e', 'Taycan', 'xridfglnfmufdxx05ootdinf', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('qre3lczia5u1phvnd56wr9dl', 'Macan', 'xridfglnfmufdxx05ootdinf', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('xofyuk5snh7brx592cufa51f', 'Model S', 'wn1f1qqmtwmn6bcybx2sdgkw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('bnfgtid1socka4d7o4hc249m', 'Model X', 'wn1f1qqmtwmn6bcybx2sdgkw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('b3wyu1v5by00dodl6eqx3n6n', 'Model Y', 'wn1f1qqmtwmn6bcybx2sdgkw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('h5aw24uvq60037tgbrdu1tgr', 'Cybertruck', 'wn1f1qqmtwmn6bcybx2sdgkw', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('xvty3jw9duk8zcrs0cei5092', 'XJ', 'mee7coymmvcdptgarcfu29p4', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('dchj5anmhphv1h264jov239c', 'F-Pace', 'mee7coymmvcdptgarcfu29p4', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('jeuzd7ehsluhd450a7hji19f', 'I-Pace', 'mee7coymmvcdptgarcfu29p4', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('x50eiiskv86jbiwjcw72pe5x', 'F-Type', 'mee7coymmvcdptgarcfu29p4', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('y2gqzwv62qsizqal2sdxcsom', 'Range Rover', 'yhwcgzkvkumcep5jcqb43mcp', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('grf7kejut6v9hj59bd1ccnco', 'Range Rover Sport', 'yhwcgzkvkumcep5jcqb43mcp', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('eo93y5gml8n8kkrpvl77lu9x', 'Discovery', 'yhwcgzkvkumcep5jcqb43mcp', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('mze0gx155wi5rj7jz1mnupvs', 'Defender', 'yhwcgzkvkumcep5jcqb43mcp', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('g6djo9nmuouxhblgi22uxrq8', 'Bentayga', 'np8kd29jztfnopgyafn7q6u2', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('tlkanurhd1bqxze3xfoukmo0', 'Flying Spur', 'np8kd29jztfnopgyafn7q6u2', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('n2354zx1qn6m6v1y3oid4uvf', 'Continental GT', 'np8kd29jztfnopgyafn7q6u2', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('kkky5g5atmahqvso427eh38a', 'Mulsanne', 'np8kd29jztfnopgyafn7q6u2', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('b7j0sq921jpqkw07mu0wqpfc', 'Phantom', 'fo3n5kp598h2xyqyl2cs59nc', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('te7wbonxs2fpijy606a3th71', 'Ghost', 'fo3n5kp598h2xyqyl2cs59nc', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('wnqvvzl2yje9fmqu8zo4m7cf', 'Cullinan', 'fo3n5kp598h2xyqyl2cs59nc', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('j0dtv5qqffw1i1obk0vmigrw', 'Wraith', 'fo3n5kp598h2xyqyl2cs59nc', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('gg0rhr410ccwdse2eednxrwf', '300', 'w6philmr2obvexbon2geq03u', 2023, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('k4gnmijx1k1300bof69sepz7', 'Pacifica', 'w6philmr2obvexbon2geq03u', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('hevcr3bep6e45e197dsu6gcm', 'XC90', 'wwi7u3218l8le15rjmo5llsn', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('mmo6lpqtcoz1xm28lblg2xxg', 'GV80', 'pnypnc9xittf0akbkkd9zgkk', 2024, 1756281758, 1756281758);
INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('hevriqyhwo2bntvszigmao3y', 'Escalade', 'au3bi8uberqkgvqyrux8znxy', 2024, 1756281758, 1756281758);

-- Car Categories
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('c5xkfk90jwpmxdmniqt311jp', 'Luxury Sedan', 'Premium executive sedans for business and formal occasions', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('l2dj7l04e9byh1jy2wpir4tb', 'SUV', 'Spacious luxury SUVs for groups and families', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('uvwrwzrzpuyq44m3r5rb1413', 'Sports Car', 'High-performance luxury sports cars', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('mq1ntg6qkyr30satt8jcevo3', 'Electric Vehicle', 'Luxury electric vehicles for eco-conscious travel', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('xxl5g55rnf9ppvytnl6etsk4', 'Van/Minibus', 'Large capacity vehicles for group transportation', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('hjsctyvbnu3zqrr4gg17u8h3', 'Convertible', 'Open-top luxury vehicles for special occasions', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('h6vr938cp7t4nbdg2903b117', 'Coupe', 'Elegant two-door luxury vehicles', 1756281758, 1756281758);
INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('dgstosgmgm0knpd046vxf2a0', 'Wagon', 'Luxury station wagons with extra cargo space', 1756281758, 1756281758);

-- Car Features
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('uypqojwg68cl2rfpdjta7owc', 'Bluetooth', 'Wireless connectivity for devices', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('idf0mu48zhx7bpgehmrnbewg', 'Wi-Fi Hotspot', 'Internet connectivity on the go', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('pbkxdb4v32t8w92k9v9srynw', 'Leather Seats', 'Premium leather upholstery', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('h3vs5lec0ddy62whnpwplvhy', 'Heated Seats', 'Temperature-controlled seating', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('a2r66vwqiwbqt26hi01vb889', 'Cooled Seats', 'Air-conditioned seating for hot weather', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('z0x6q6jyyqabwtzi6aqj8dym', 'Massage Seats', 'Built-in seat massage functionality', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('a86vkc77zmzvw18sg7szesma', 'Sunroof', 'Panoramic or standard sunroof', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('y6qi9wyxbnmgwkedhsvn93so', 'Navigation System', 'Built-in GPS navigation', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('xn7gja204qykawoiuk9g888y', 'Premium Sound System', 'High-end audio system', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('fzczj3l5cec6qeqpfbykbfrl', 'Rear Entertainment', 'Screens and entertainment for rear passengers', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('d719qnpiy2h842ythpu1ief6', 'Mini Bar', 'Built-in refreshment storage', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('qyyhew4i1ajh5rb87vest820', 'Champagne Cooler', 'Temperature-controlled beverage storage', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('zzvhwhyfb9d244sa8r552v89', 'Privacy Partition', 'Separation between driver and passenger areas', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('ydnm1pr7s7qc13705flg12iq', 'Tinted Windows', 'Privacy and UV protection glass', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('peukhuzq9xnog17l4t7exvo4', 'Air Conditioning', 'Climate control system', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('wdykvkld12ezsye2tbuh3wrx', 'USB Charging', 'Multiple USB charging ports', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('m48h4hizmqnhj290yn1k18ij', 'Wireless Charging', 'Qi wireless phone charging pad', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('nrzkjm7ukndun4qlynq7zod9', 'Keyless Entry', 'Push-button start and keyless access', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('ta7pzujsjdwu4ezenyrac9k1', 'Adaptive Cruise Control', 'Advanced driver assistance', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('ilrtadxrctk7dfqlrc4e9fqr', '360° Camera', 'Surround view monitoring system', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('ujwbmyya9k5dp1kpb1e9oa21', 'Lane Departure Warning', 'Safety assistance feature', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('hb1l95r16any2rozttt4gh8k', 'Automatic Emergency Braking', 'Collision avoidance system', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('xm3j3rvykv9uek3bgt182sv9', 'Night Vision', 'Enhanced visibility in low light', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('wijlrcq1oui718u6vw13s1fp', 'Heads-Up Display', 'Information projected on windshield', 1756281758, 1756281758);
INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('b2zgobygxdzuc1oewgcmopez', 'Ambient Lighting', 'Customizable interior lighting', 1756281758, 1756281758);

-- Fuel Types
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('m9uwrsjawhaqscq2qhmkviif', 'Petrol', 1756281758, 1756281758);
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('bpn5bbmqtau61lcrzm57tail', 'Diesel', 1756281758, 1756281758);
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('lr1aiezb5uhc7luz2mwa6vkf', 'Hybrid', 1756281758, 1756281758);
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('nrq5p05yb0tc1exvry3luzsk', 'Electric', 1756281758, 1756281758);
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('vqbqcczn6zbi1eqvogs9ex8y', 'Plug-in Hybrid', 1756281758, 1756281758);
INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('jkhnkoc7ippwjbn5eq9jfjrc', 'Hydrogen', 1756281758, 1756281758);

-- Transmission Types
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('seb77aaakp6s5qasep0k0wq9', 'Automatic', 1756281758, 1756281758);
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('qfrqpfopaet2qrhrrc6udgkd', 'Manual', 1756281758, 1756281758);
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('g4wh64y1oxhvkmyhmn7o5469', 'CVT', 1756281758, 1756281758);
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('zlnq4jxhbsvtf1emrei3huow', 'Semi-Automatic', 1756281758, 1756281758);
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('w77hkllzmv68oiblcd57lj7h', 'Dual-Clutch', 1756281758, 1756281758);
INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('abgk3fdnu36y2w7op4f5sa2j', 'Single-Speed', 1756281758, 1756281758);

-- Drive Types
INSERT INTO car_drive_types (id, name, created_at, updated_at) VALUES ('rgfls568p590yi2i2o6wmjut', 'Front-Wheel Drive (FWD)', 1756281758, 1756281758);
INSERT INTO car_drive_types (id, name, created_at, updated_at) VALUES ('qye9f377h96nmydrhitbcz4o', 'Rear-Wheel Drive (RWD)', 1756281758, 1756281758);
INSERT INTO car_drive_types (id, name, created_at, updated_at) VALUES ('zfyjp3toahvjbt28wx88ikmb', 'All-Wheel Drive (AWD)', 1756281758, 1756281758);
INSERT INTO car_drive_types (id, name, created_at, updated_at) VALUES ('oihmoiz58tp2eu5yl2uni2qi', 'Four-Wheel Drive (4WD)', 1756281758, 1756281758);

-- Condition Types
INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('bpgxc8g5r9gwdascgnfepbq8', 'Brand New', 1756281758, 1756281758);
INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('spu9o5hdy98pbuxks12xpu3e', 'Excellent', 1756281758, 1756281758);
INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('m2nrwveozsj16y3i77r606in', 'Very Good', 1756281758, 1756281758);
INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('pzp0br568cwfaujxjpdfgal5', 'Good', 1756281758, 1756281758);
INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('h16qbk2j2oe6ftlnwxpcft8d', 'Fair', 1756281758, 1756281758);

