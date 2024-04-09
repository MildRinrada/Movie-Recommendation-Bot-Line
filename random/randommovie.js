import { Payload } from 'dialogflow-fulfillment' //เรียกใช้ Payload เพื่อใช้กับการส่งความแบบ JSON
import { createRequire } from 'module'; //createRequire ใช้สำหรับรับข้อมูล
const require = createRequire(import.meta.url);
const fs = require('fs');
const csv = require('csv-parser'); //ใช้อ่านข้อมูล CSV format
let results = [] //เก็บข้อมูลใน csv เป็นอาเรย์ ทุกแถว

const movies = [] //เก็บไทป์

fs.createReadStream('./data/data.csv') //อ่าน csv
  .pipe(csv({
    headers: false
  }))
  .on('data', (data) => {
    results.push(data) //เก็บลงในอาเรย์results 
    let movie = {
      index: movies.length,
      imgURL: data[0],
      title: data[1],
      text: data[2],
      url: data[3],
      desc: data[4],
      year: data[5],
      lang: data[6],
      type: [],
    }
    if (data[7]) movie.type.push(data[7])
    if (data[8]) movie.type.push(data[8])
    if (data[9]) movie.type.push(data[9])
    movies.push(movie)
  })

function getRandomRange(min, max) { //ใช้สุ่มข้อมูลในช่วง min ถึง max 
  min = Math.ceil(min); 
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function random() { //ย่อส่วนของ getRandomRangeให้สั้นลง
  var g = getRandomRange(1, results.length)
  return g;
}

export function randomMovie(year, type, lang) { //ใช้สุ่ม
  let choices = movies.filter((movie) => {
    if (year && movie.year != year) {
        return false //ถ้าปีไม่ตรงที่สุ่มมา ให้สุ่มไหม่
    }
    if (type) {
      for (let i in type) {
        if (!movie.type.includes(type[i])) {
          return false //ถ้ามีประเภทที่ไม่ตรงกับหนังที่สุ่มมา ให้สุ่มไหม่
        }
      }
    }
    if (lang && movie.lang != lang) {
        return false //ถ้าภาษาไม่ตรงที่สุ่มมา ให้สุ่มไหม่
    }
    return true //ไม่ต้องสุ่มไหม่
  })
  if (choices.length == 0) return null
  return choices[getRandomRange(0, choices.length - 1)]
}

export function check(r,year,type,lan) {
  let movie = movies[r]
  if (year && movie.year != year) {
      return true //ถ้าปีไม่ตรงที่สุ่มมา ให้สุ่มไหม่
  }
  if (type) {
    for (let i in type) {
      if (!movie.type.includes(type[i])) {
        return true //ถ้ามีประเภทที่ไม่ตรงกับหนังที่สุ่มมา ให้สุ่มไหม่
      }
    }
  }
  if (lan && movie.lang != lan) {
    return true //ถ้าภาษาไม่ตรงที่สุ่มมา ให้สุ่มไหม่
  }
  return false //ไม่ต้องสุ่มไหม่
}

export function year_type_lan(agent) {
  console.log("เข้า function year_type_lan");
  let year = agent.parameters.year //รับปีมาจาก User
  let type = agent.parameters.type //รับแนวหนังมาจาก User
  let language = agent.parameters.language //รับภาษามาจาก User
  console.log("year: "+year+" type: "+type+" language: "+language);
  let res = randomMovie(year, type, language) //ไปสุ่มหาหนังตามที่ User ส่งค่ามาให้

  if (res) { //แสดงผลลัพธ์
    var payload = new Payload('LINE', movieResponse(res), { sendAsMessage: true });
    agent.add(payload);
    agent.add(res.desc); //คำอธิบายหนัง
    } else { //กรณีไม่เจอหนังในexcel
    agent.add("วันนี้ดูอะไร ต้องขออภัยด้วย ;w; ในตอนนี้ ไม่มีหนังภายใน ปี แนว หรือ ภาษาที่คุณกำลังต้องการ ลองหา ปี แนวหรือภาษา อื่นดูนะคับ")
  }
}

export function random_movie_no_match(agent){ //ไม่ต้องมีการระบุค่าใดๆ ให้สุ่มจากทุกแถวเลย
  console.log("สุ่มโดยuserไม่ระบุ");
  var r = random(); //เลือกสุ่มทุกแถว
  var payload = new Payload('LINE', pr(r), { sendAsMessage: true });
  agent.add(payload); //แสดงแบบ JSON
  agent.add(results[r][4]); //คำอธิบายหนัง
}

export function type(agent) {
  let type = agent.parameters.type //รับแนวหนังมาจาก User
  console.log(type);
  
  var r = random();
  while(check(r,undefined,type,undefined)) { //ตรวจสอบแนวหนังในExcelแล้วสุ่ม
       r = random();
  }
  var payload = new Payload('LINE', pr(r), { sendAsMessage: true });
  agent.add(payload); //แสดงแบบ JSON
  agent.add(results[r][4]); //คำอธิบายหนัง
}


export function year(agent) {
  let year = agent.parameters.year //รับปีมาจาก User
  console.log(year);
  
  var r = random();
  while(check(r,year)) { //ตรวจสอบปีในExcelแล้วสุ่ม
       r = random();
  }
  var payload = new Payload('LINE', pr(r), { sendAsMessage: true });
  agent.add(payload); //แสดงแบบ JSON
  agent.add(results[r][4]); //คำอธิบายหนัง
}

export function language(agent) {
  let language = agent.parameters.language //รับภาษามาจาก User
  console.log(language);
  
  var r = random(); 
  while(check(r,undefined,undefined,language)) { //ตรวจสอบภาษาในExcelแล้วสุ่ม
       r = random();
  }
  var payload = new Payload('LINE', pr(r), { sendAsMessage: true });
  agent.add(payload); //แสดงแบบ JSON
  agent.add(results[r][4]); //คำอธิบายหนัง
}

export function pr(r) {
  return {
    "type": "template",
    "altText": "แนะนำหนังปี"+ results[r][5] + " ภาษา " + results[r][6] + " " + results[r][7]+ results[r][8]+ results[r][9],
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": results[r][0],
      "imageAspectRatio": "square",
      "title": results[r][1],
      "text": results[r][2],
      "actions": [ {
        "type": "uri",
        "label": "ดูตัวอย่างหนัง",
        "uri": results[r][3]
      }]
    }
  }
}

export function movieResponse(movie) { 
  return {
    "type": "template",
    "altText": "แนะนำหนังปี"+ movie.year + " ภาษา " + movie.lang + " " + movie.type.join(""),
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": movie.imgURL,
      "imageAspectRatio": "square",
      "title": movie.title,
      "text": movie.text,
      "actions": [
        {
          "type": "uri",
          "label": "ดูตัวอย่างหนัง",
          "uri": movie.url
        }
      ]
    }
  }
}
