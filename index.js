import express from 'express' //ใช้ในการทำ Web service เช่น REST API ได้
import { WebhookClient } from 'dialogflow-fulfillment' //จะได้ใช้อ่าน intent จาก User ได้
const app = express() //ฟังก์ชั่น express รวบให้เป็นตัวแปร app สั้นๆ
import * as rd from './random/randommovie.js' //ดึงฟังก์ชั่นทั้งหมดใน randommovie.js เพื่อมาใช้งานใน index.js

app.post('/api/dialogflow', express.json(), (req, res) => {
  let agent = new WebhookClient({ request: req, response: res })
  let intentMap = new Map()
  
  //รับค่าแนวหนัง จาก User 
  intentMap.set("type", rd.type);
  //รับค่าภาษา จาก User 
  intentMap.set("language", rd.language);
  //รับค่าปี จาก User 
  intentMap.set("year", rd.year);
  //สุ่มแบบไม่ระบุ
  intentMap.set("ขอสุ่มแบบไม่ระบุ", rd.random_movie_no_match);
  //รับ2-3ค่า จาก User แล้วสุ่ม
  intentMap.set("type.year.language", rd.year_type_lan);
  
  agent.handleRequest(intentMap)
})

app.listen(8081, () => {
  console.log("listening on port 8081") //port 8081 ใช้สำหรับการรับส่งข้อมูลเว็บ
})