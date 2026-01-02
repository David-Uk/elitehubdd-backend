import{r as i,j as e,u as V,a as H}from"./index-BXI_2l5g.js";import{b as Y}from"./index-BTbVSX9E.js";import{a as K}from"./api.config-3dA0qCxX.js";import{S as Z,M as J}from"./SEO-WLcqI6Q_.js";import{m as q,g as Q}from"./roomImageMapping-PCXohn6S.js";import{u as ee}from"./Toast-DOxKuCxJ.js";const se=[{id:"R-101",roomNumber:"101",type:"Comfort Room",floor:1,capacity:2,price:6e4,status:"available",amenities:["WiFi","Air Conditioning","Flat-screen TV","Private Bathroom"]},{id:"R-102",roomNumber:"102",type:"Delux Room",floor:1,capacity:2,price:78e3,status:"available",amenities:["WiFi","Air Conditioning","Mini Bar","Work Desk","Flat-screen TV"]},{id:"R-103",roomNumber:"103",type:"Executive Room",floor:1,capacity:2,price:95e3,status:"available",amenities:["WiFi","Air Conditioning","Mini Bar","Smart TV","Executive Work Desk"]},{id:"R-201",roomNumber:"201",type:"2 Bedroom Flat",floor:2,capacity:4,price:16e4,status:"occupied",amenities:["WiFi","Air Conditioning","Kitchen","Living Area","TV","Parking"]},{id:"R-202",roomNumber:"202",type:"2 Bedroom Duplex",floor:2,capacity:4,price:22e4,status:"available",amenities:["WiFi","Air Conditioning","Full Kitchen","Living Room","TV","Parking"]},{id:"R-301",roomNumber:"301",type:"Penthouse",floor:3,capacity:4,price:145e3,status:"reserved",amenities:["WiFi","Air Conditioning","Panoramic Views","Smart TV","Rooftop Access"]},{id:"R-302",roomNumber:"302",type:"3 Bedroom Duplex",floor:3,capacity:6,price:28e4,status:"available",amenities:["WiFi","Air Conditioning","Full Kitchen","Living Room","2 Bathrooms","Parking"]}],ae=()=>{const[o,t]=i.useState([]),[r,c]=i.useState(!1),[y,x]=i.useState(null),n=i.useCallback(async(g,h,b=null)=>{c(!0),x(null);try{const p=new URLSearchParams;g&&h&&(p.append("startDate",g),p.append("endDate",h)),b&&p.append("roomTypeId",b);const f=p.toString(),w=`/reservations/available${f?`?${f}`:""}`,j=await K("GET",w,null,null);j?.success&&j?.data&&t(j.data)}catch(p){console.error("Error fetching accommodations:",p),x(p.message),t(se)}finally{c(!1)}},[]);return{accommodations:o,loading:r,error:y,checkAvailability:n}};/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=o=>o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ne=o=>o.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,c)=>c?c.toUpperCase():r.toLowerCase()),O=o=>{const t=ne(o);return t.charAt(0).toUpperCase()+t.slice(1)},_=(...o)=>o.filter((t,r,c)=>!!t&&t.trim()!==""&&c.indexOf(t)===r).join(" ").trim(),ie=o=>{for(const t in o)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var oe={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=i.forwardRef(({color:o="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:c,className:y="",children:x,iconNode:n,...g},h)=>i.createElement("svg",{ref:h,...oe,width:t,height:t,stroke:o,strokeWidth:c?Number(r)*24/Number(t):r,className:_("lucide",y),...!x&&!ie(g)&&{"aria-hidden":"true"},...g},[...n.map(([b,p])=>i.createElement(b,p)),...Array.isArray(x)?x:[x]]));/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=(o,t)=>{const r=i.forwardRef(({className:c,...y},x)=>i.createElement(re,{ref:x,iconNode:t,className:_(`lucide-${te(O(o))}`,`lucide-${o}`,c),...y}));return r.displayName=O(o),r};/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],E=C("calendar",le);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],de=C("mail",ce);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]],pe=C("message-square",me);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],xe=C("phone",ue);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],he=C("printer",ge);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],M=C("user",fe);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],ye=C("users",be);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],je=C("x",ve),Ne=({isOpen:o,onClose:t,room:r,checkInDate:c,checkOutDate:y,onSuccess:x})=>{const[n,g]=i.useState({roomTypeId:r?.roomType?.id||"",checkInDate:c||"",checkOutDate:y||"",numberOfGuests:1,specialRequests:"",guestFirstName:"",guestLastName:"",guestEmail:"",guestPhone:""});i.useEffect(()=>{r?.roomType?.id&&g(d=>({...d,roomTypeId:r.roomType.id}))},[r]);const[h,b]=i.useState(!1),[p,f]=i.useState(""),[w,j]=i.useState(!1),[s,I]=i.useState(null),v=d=>{const{name:u,value:T}=d.target;g(S=>({...S,[u]:T}))},R=async d=>{if(d.preventDefault(),b(!0),f(""),!n.roomTypeId){f("Room information is missing. Please try selecting the room again."),b(!1);return}try{const u=new Date(n.checkInDate).toISOString(),T=new Date(n.checkOutDate).toISOString(),S={roomTypeId:n.roomTypeId,checkInDate:u,checkOutDate:T,numberOfGuests:parseInt(n.numberOfGuests),specialRequests:n.specialRequests||"No special requests",guestFirstName:n.guestFirstName,guestLastName:n.guestLastName,guestEmail:n.guestEmail,guestPhone:n.guestPhone};console.log("Submitting booking request:",S);const D=await(await fetch("http://localhost:3000/api/reservations/guest/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)})).json();D.success?(I(D.data),j(!0),x(D)):f(D.message||"Failed to submit reservation request")}catch(u){console.error("Booking error:",u),f("An error occurred while submitting your reservation. Please try again.")}finally{b(!1)}},k=()=>{h||(j(!1),I(null),f(""),t())},A=()=>{if(n.checkInDate&&n.checkOutDate){const d=new Date(n.checkInDate),u=new Date(n.checkOutDate),T=Math.abs(u-d);return Math.ceil(T/(1e3*60*60*24))}return 0},P=()=>{const d=A(),u=r?.roomType?.basePrice||0;return d*u},B=()=>{document.getElementById("print-confirmation");const d=window.open("","_blank");d.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Confirmation - ${s?.reservationNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #059669;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #059669;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              color: #059669;
              font-size: 18px;
              margin-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              min-width: 150px;
            }
            .info-value {
              color: #1f2937;
              text-align: right;
            }
            .highlight {
              background-color: #f0fdf4;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #059669;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .amenities-list {
              list-style: none;
              padding: 0;
            }
            .amenities-list li {
              padding: 3px 0;
              border-bottom: 1px dotted #e5e7eb;
            }
            @media print {
              body { margin: 15px; }
              .header { page-break-after: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Reservation Confirmation</h1>
            <p>Elite Hub By Double D - Benin City, Nigeria</p>
            <p><strong>${new Date().toLocaleDateString()}</strong></p>
          </div>

          <div class="section">
            <div class="section-title">Reservation Details</div>
            <div class="info-row">
              <span class="info-label">Reservation Number:</span>
              <span class="info-value">${s?.reservationNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Reservation ID:</span>
              <span class="info-value">${s?.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${s?.status?.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Room Assigned:</span>
              <span class="info-value">${s?.room?.roomNumber} - ${s?.room?.roomType?.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Check-in Date:</span>
              <span class="info-value">${new Date(s?.checkInDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Check-out Date:</span>
              <span class="info-value">${new Date(s?.checkOutDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Number of Guests:</span>
              <span class="info-value">${s?.numberOfGuests}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Financial Information</div>
            <div class="info-row">
              <span class="info-label">Base Price per Night:</span>
              <span class="info-value">₦${parseFloat(s?.costBreakdown?.basePrice).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Number of Nights:</span>
              <span class="info-value">${s?.costBreakdown?.nights}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Amount:</span>
              <span class="info-value"><strong>₦${parseFloat(s?.totalAmount).toLocaleString()}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Paid Amount:</span>
              <span class="info-value">₦${parseFloat(s?.paidAmount).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Balance Due:</span>
              <span class="info-value"><strong>₦${(parseFloat(s?.totalAmount)-parseFloat(s?.paidAmount)).toLocaleString()}</strong></span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Guest Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${s?.guest?.firstName} ${s?.guest?.lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${s?.guest?.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${s?.guest?.phone}</span>
            </div>
            ${s?.guest?.idNumber?`
            <div class="info-row">
              <span class="info-label">Guest ID:</span>
              <span class="info-value">${s.guest.idNumber}</span>
            </div>`:""}
          </div>

          <div class="section">
            <div class="section-title">Room Details</div>
            <div class="info-row">
              <span class="info-label">Room Type:</span>
              <span class="info-value">${s?.room?.roomType?.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Capacity:</span>
              <span class="info-value">${s?.room?.roomType?.capacity} guests</span>
            </div>
            <div class="info-row">
              <span class="info-label">Room Size:</span>
              <span class="info-value">${s?.room?.roomType?.size} m²</span>
            </div>
            <div class="info-row">
              <span class="info-label">Bed Type:</span>
              <span class="info-value">${s?.room?.roomType?.bedType}</span>
            </div>
            ${s?.room?.roomType?.amenities?.length>0?`
            <div style="margin-top: 10px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 5px;">Amenities:</div>
              <ul class="amenities-list">
                ${s.room.roomType.amenities.map(u=>`<li>✓ ${u}</li>`).join("")}
              </ul>
            </div>`:""}
          </div>

          ${s?.specialRequests?`
          <div class="section">
            <div class="section-title">Special Requests</div>
            <div style="background-color: #fef3c7; padding: 10px; border-radius: 5px; border-left: 3px solid #f59e0b;">
              ${s.specialRequests}
            </div>
          </div>`:""}

          <div class="highlight">
            <strong>Important Information:</strong><br>
            Your reservation is currently <strong>PENDING</strong> approval. You will receive a confirmation email once your reservation is approved by our staff. Please keep this confirmation for your records.
          </div>

          <div class="footer">
            <p><strong>Elite Hub By Double D</strong></p>
            <p>Benin City, Nigeria</p>
            <p>Email: info@elitehub.com | Phone: +234 XXX XXX XXXX</p>
            <p style="margin-top: 10px; font-size: 12px;">
              This is an automatically generated confirmation. Valid upon presentation of valid ID.
            </p>
          </div>
        </body>
      </html>
    `),d.document.close(),d.focus(),setTimeout(()=>{d.print(),d.close()},500)};return o?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",children:e.jsxs("div",{className:"bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:w?"Reservation Confirmed!":"Complete Your Booking"}),e.jsx("button",{onClick:k,disabled:h,className:"p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50",children:e.jsx(je,{className:"w-5 h-5 text-gray-500"})})]}),e.jsx("div",{className:"px-6 py-4",children:w?e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-green-900 mb-4",children:"🎉 Reservation Request Submitted Successfully!"}),e.jsx("p",{className:"text-green-800 mb-4",children:"Your reservation request has been received. You will receive a confirmation email once approved."}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Reservation Number:"}),e.jsx("span",{className:"text-green-800",children:s?.reservationNumber})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Reservation ID:"}),e.jsx("span",{className:"text-green-800",children:s?.id})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Status:"}),e.jsx("span",{className:"text-green-800 capitalize",children:s?.status})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Room:"}),e.jsxs("span",{className:"text-green-800",children:[s?.room?.roomNumber," - ",s?.room?.roomType?.name]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Check-in:"}),e.jsx("span",{className:"text-green-800",children:new Date(s?.checkInDate).toLocaleDateString()})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Check-out:"}),e.jsx("span",{className:"text-green-800",children:new Date(s?.checkOutDate).toLocaleDateString()})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Guests:"}),e.jsx("span",{className:"text-green-800",children:s?.numberOfGuests})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Total Amount:"}),e.jsxs("span",{className:"text-green-800 font-semibold",children:["₦",parseFloat(s?.totalAmount).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Paid Amount:"}),e.jsxs("span",{className:"text-green-800",children:["₦",parseFloat(s?.paidAmount).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium text-green-900",children:"Balance:"}),e.jsxs("span",{className:"text-green-800 font-semibold",children:["₦",(parseFloat(s?.totalAmount)-parseFloat(s?.paidAmount)).toLocaleString()]})]})]}),s?.costBreakdown&&e.jsxs("div",{className:"mt-4 pt-4 border-t border-green-200",children:[e.jsx("h4",{className:"font-medium text-green-900 mb-2",children:"Cost Breakdown:"}),e.jsxs("div",{className:"space-y-1 text-green-800",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Base Price per Night:"}),e.jsxs("span",{children:["₦",parseFloat(s.costBreakdown.basePrice).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Number of Nights:"}),e.jsx("span",{children:s.costBreakdown.nights})]}),e.jsxs("div",{className:"flex justify-between font-semibold",children:[e.jsx("span",{children:"Total Cost:"}),e.jsxs("span",{children:["₦",s.costBreakdown.totalCost?.toLocaleString()]})]})]})]}),e.jsxs("div",{className:"mt-6 pt-4 border-t border-green-200",children:[e.jsx("h4",{className:"font-medium text-green-900 mb-2",children:"Guest Information:"}),e.jsxs("div",{className:"text-green-800",children:[e.jsxs("p",{children:[s?.guest?.firstName," ",s?.guest?.lastName]}),e.jsx("p",{children:s?.guest?.email}),e.jsx("p",{children:s?.guest?.phone}),s?.guest?.idNumber&&e.jsxs("p",{children:["ID: ",s.guest.idNumber]})]})]}),s?.room?.roomType&&e.jsxs("div",{className:"mt-4 pt-4 border-t border-green-200",children:[e.jsx("h4",{className:"font-medium text-green-900 mb-2",children:"Room Details:"}),e.jsxs("div",{className:"text-green-800",children:[e.jsxs("p",{children:["Room Type: ",s.room.roomType.name]}),e.jsxs("p",{children:["Capacity: ",s.room.roomType.capacity," guests"]}),e.jsxs("p",{children:["Size: ",s.room.roomType.size," m²"]}),e.jsxs("p",{children:["Bed Type: ",s.room.roomType.bedType]}),s.room.roomType.amenities?.length>0&&e.jsxs("div",{className:"mt-2",children:[e.jsx("p",{className:"font-medium",children:"Amenities:"}),e.jsxs("ul",{className:"list-disc list-inside text-sm",children:[s.room.roomType.amenities.slice(0,3).map((d,u)=>e.jsx("li",{children:d},u)),s.room.roomType.amenities.length>3&&e.jsxs("li",{children:["+",s.room.roomType.amenities.length-3," more"]})]})]})]})]}),s?.specialRequests&&e.jsxs("div",{className:"mt-4 pt-4 border-t border-green-200",children:[e.jsx("h4",{className:"font-medium text-green-900 mb-2",children:"Special Requests:"}),e.jsx("p",{className:"text-green-800",children:s.specialRequests})]}),e.jsx("div",{className:"mt-4 pt-4 border-t border-green-200",children:e.jsx("div",{className:"bg-green-100 rounded-lg p-3",children:e.jsxs("p",{className:"text-green-800 text-sm",children:[e.jsx("strong",{children:"Important:"})," Your reservation is currently ",e.jsx("span",{className:"font-semibold",children:"pending"}),". You will receive a confirmation email once your reservation is approved by our staff."]})})})]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("button",{onClick:B,className:"flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2",children:[e.jsx(he,{className:"w-4 h-4"}),"Print Confirmation"]}),e.jsx("button",{onClick:k,className:"flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",children:"Close"})]})]}):e.jsxs("form",{onSubmit:R,className:"space-y-6",children:[e.jsxs("div",{className:"bg-amber-50 border border-amber-200 rounded-lg p-4",children:[e.jsx("h3",{className:"font-semibold text-amber-900 mb-2",children:"Selected Room"}),e.jsx("p",{className:"text-amber-800",children:r?.roomType?.name}),e.jsxs("p",{className:"text-amber-700 text-sm",children:["₦",r?.roomType?.basePrice?.toLocaleString()," per night"]}),A()>0&&e.jsxs("p",{className:"text-amber-900 font-semibold mt-2",children:[A()," night(s) - Total: ₦",P().toLocaleString()]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(E,{className:"w-4 h-4 inline mr-2"}),"Check-in Date"]}),e.jsx("input",{type:"date",name:"checkInDate",value:n.checkInDate,onChange:v,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(E,{className:"w-4 h-4 inline mr-2"}),"Check-out Date"]}),e.jsx("input",{type:"date",name:"checkOutDate",value:n.checkOutDate,onChange:v,min:n.checkInDate,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(ye,{className:"w-4 h-4 inline mr-2"}),"Number of Guests"]}),e.jsx("input",{type:"number",name:"numberOfGuests",value:n.numberOfGuests,onChange:v,min:"1",max:r?.roomType?.capacity||4,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"font-semibold text-gray-900",children:"Guest Information"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(M,{className:"w-4 h-4 inline mr-2"}),"First Name"]}),e.jsx("input",{type:"text",name:"guestFirstName",value:n.guestFirstName,onChange:v,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(M,{className:"w-4 h-4 inline mr-2"}),"Last Name"]}),e.jsx("input",{type:"text",name:"guestLastName",value:n.guestLastName,onChange:v,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(de,{className:"w-4 h-4 inline mr-2"}),"Email Address"]}),e.jsx("input",{type:"email",name:"guestEmail",value:n.guestEmail,onChange:v,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(xe,{className:"w-4 h-4 inline mr-2"}),"Phone Number"]}),e.jsx("input",{type:"tel",name:"guestPhone",value:n.guestPhone,onChange:v,required:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:[e.jsx(pe,{className:"w-4 h-4 inline mr-2"}),"Special Requests (Optional)"]}),e.jsx("textarea",{name:"specialRequests",value:n.specialRequests,onChange:v,rows:"3",placeholder:"Any special requirements or requests...",className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),p&&e.jsx("div",{className:"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg",children:p}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{type:"button",onClick:k,disabled:h,className:"flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50",children:"Cancel"}),e.jsx("button",{type:"submit",disabled:h,className:"flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50",children:h?"Submitting...":"Complete Booking"})]})]})})]})}):null};function Re(){V();const[o]=H(),{accommodations:t,loading:r,checkAvailability:c}=ae(),{toast:y,showSuccess:x,clearToast:n}=ee(),[g,h]=i.useState(""),[b,p]=i.useState(""),[f,w]=i.useState(""),[j,s]=i.useState(""),[I,v]=i.useState({}),[R,k]=i.useState(!1),[A,P]=i.useState(null),[B,d]=i.useState(!1),u="Available Accommodations - Elite Hub By Double D",T="Browse and book our available luxury accommodations. Check availability and reserve your perfect room at Elite Hub Hotel in Benin City, Nigeria.",S=window.location.href;i.useEffect(()=>{const a={};return t.forEach(l=>{const m=q(l.roomType.name);m.length>1&&(a[l.roomType.id]=setInterval(()=>{v(N=>({...N,[l.roomType.id]:(N[l.roomType.id]||0)===m.length-1?0:(N[l.roomType.id]||0)+1}))},3e3))}),()=>{Object.values(a).forEach(l=>clearInterval(l))}},[t]),i.useEffect(()=>{const a=new Date().toISOString().split("T")[0],l=new Date(Date.now()+864e5).toISOString().split("T")[0];h(a),p(l)},[]),i.useEffect(()=>{const a=o.get("roomType");a&&w(a),c()},[o,c]),i.useEffect(()=>{const a=o.get("roomType");if(a&&t.length>0&&!R){const l=t.find(N=>N.roomType.name.toLowerCase()===a.toLowerCase()),m=l?l.roomType.id:null;m&&c(null,null,m),k(!0)}else!a&&!R&&k(!0)},[t,o,c,R]);const L=()=>{const a=t.find(m=>m.roomType.name===f),l=a?a.roomType.id:null;c(g,b,l)},D=()=>{w(""),s(""),k(!1),c()},G=[...new Set(t.map(a=>a.roomType.name))],$=t.filter(a=>{let l=!0;if(f&&a.roomType.name!==f&&(l=!1),j){const[m,N]=j.split("-").map(Number);(parseFloat(a.roomType.basePrice)<m||parseFloat(a.roomType.basePrice)>N)&&(l=!1)}return l}),z=a=>{P(a),d(!0)},W=a=>{x("Reservation request submitted successfully! Check your email for confirmation.")},X=()=>{d(!1),P(null)};return e.jsxs(e.Fragment,{children:[e.jsx(Z,{title:u,description:T,url:S}),e.jsxs(J,{children:[e.jsxs("div",{className:"relative bg-gray-900 min-h-[400px] w-full",children:[e.jsxs("div",{className:"absolute inset-0 overflow-hidden",children:[e.jsx("img",{className:"w-full h-full object-cover opacity-40",src:"/images/img24.jpeg",alt:"Accommodations"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"})]}),e.jsx("div",{className:"relative w-full h-full flex items-center",children:e.jsx("div",{className:"container-full",children:e.jsxs("div",{className:"max-w-2xl text-white py-20",children:[e.jsxs("h1",{className:"text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4",children:["Find Your Perfect ",e.jsx("span",{className:"text-amber-400",children:"Stay"})]}),e.jsx("p",{className:"text-lg sm:text-xl text-gray-200",children:"Browse our available luxury accommodations and book your ideal room"})]})})})]}),e.jsx("div",{className:"bg-white shadow-lg py-8",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Check-in Date"}),e.jsx("input",{type:"date",value:g,onChange:a=>h(a.target.value),min:new Date().toISOString().split("T")[0],className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Check-out Date"}),e.jsx("input",{type:"date",value:b,onChange:a=>p(a.target.value),min:g,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Room Type"}),e.jsxs("select",{value:f,onChange:a=>w(a.target.value),className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent",children:[e.jsx("option",{value:"",children:"All Types"}),G.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"flex items-end gap-2",children:[e.jsx("button",{onClick:L,disabled:r,className:"flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg transition duration-300",children:r?"Searching...":"Search"}),e.jsx("button",{onClick:D,className:"px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition duration-300",title:"Clear all filters",children:"Clear"})]})]}),e.jsxs("div",{className:"mt-4 text-sm text-gray-600",children:[e.jsxs("p",{children:["💡 ",e.jsx("strong",{children:"Search Options:"})]}),e.jsxs("ul",{className:"mt-1 space-y-1",children:[e.jsx("li",{children:"• Leave dates empty to see all available rooms"}),e.jsx("li",{children:"• Add dates to check availability for specific dates"}),e.jsx("li",{children:"• Select a room type to filter by specific accommodation"}),e.jsx("li",{children:"• Use price filters in the sidebar to narrow results"})]})]})]})}),e.jsx("div",{className:"bg-gray-50 py-16",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"mb-8 flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-base text-amber-600 font-semibold tracking-wide uppercase",children:"Accommodation"}),e.jsx("h3",{className:"mt-2 text-3xl font-extrabold text-gray-900",children:"Available Rooms"})]}),e.jsxs("div",{className:"text-sm text-gray-500",children:[$.length," room",$.length!==1?"s":""," available"]})]}),e.jsx("div",{children:$.length>0?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:$.map(a=>{const l=q(a.roomType.name),m=Q(a.roomType.name),N=I[a.roomType.id]||0;return console.log(`Room: ${a.roomType.name}`,{images:l,roomDetails:m,availableCount:a.availableCount}),e.jsxs("div",{className:"bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-105",children:[e.jsxs("div",{className:"relative h-64",children:[e.jsx("img",{src:l[N],alt:a.roomType.name,className:"w-full h-full object-cover"}),e.jsxs("div",{className:"absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-amber-600",children:[a.availableCount," Available"]}),a.availableCount>0&&e.jsxs("div",{className:"absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold",children:[a.availableCount," available"]})]}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"uppercase tracking-wide text-sm text-amber-600 font-semibold mb-2",children:[m.size," • ",m.capacity]}),e.jsx("h3",{className:"mt-2 text-2xl font-extrabold text-gray-900 mb-3",children:a.roomType.name}),e.jsx("p",{className:"text-gray-700 mb-4 text-sm leading-relaxed",children:a.roomType.description}),m.amenities&&m.amenities.length>0&&e.jsx("div",{className:"mb-4 border-t border-gray-100 pt-4",children:e.jsxs("details",{className:"group",children:[e.jsxs("summary",{className:"flex items-center justify-between cursor-pointer list-none focus:outline-none",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-900",children:"Key Features"}),e.jsx("span",{className:"ml-2 transform group-open:rotate-180 transition-transform duration-200",children:e.jsx(Y,{className:"h-4 w-4 text-gray-500"})})]}),e.jsx("div",{className:"mt-4 grid grid-cols-1 gap-3",children:m.amenities.map((F,U)=>e.jsxs("div",{className:"flex items-start",children:[e.jsx("div",{className:"flex-shrink-0 mt-1",children:e.jsx("span",{className:"text-base",children:F.icon})}),e.jsx("p",{className:"ml-3 text-sm text-gray-600",children:F.text})]},U))})]})}),a.roomType.numberOfBeds&&e.jsx("div",{className:"mb-4 flex items-center gap-4 text-sm text-gray-600",children:e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"text-amber-500",children:"🛌"}),a.roomType.numberOfBeds," ",a.roomType.bedType]})}),e.jsx("div",{className:"border-t border-gray-100 pt-4 mt-4",children:e.jsxs("div",{className:"flex justify-between items-end",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsxs("p",{className:"text-2xl font-bold text-amber-600",children:["₦",parseFloat(a.roomType.basePrice).toLocaleString()]}),e.jsx("p",{className:"text-sm text-gray-500",children:"per night"})]}),a.availableCount>1&&e.jsxs("p",{className:"text-xs text-green-600 mt-1",children:[a.availableCount," rooms available"]})]}),e.jsx("button",{onClick:()=>z(a),disabled:a.availableCount===0,className:"px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition duration-300 transform hover:scale-105 shadow-lg",children:a.availableCount===0?"Sold Out":"Book Now"})]})})]})]},a.roomType.id)})}):e.jsx("div",{className:"bg-gray-100 rounded-xl p-16 text-center",children:e.jsx("p",{className:"text-xl text-gray-600",children:"No accommodations available for the selected dates. Please try different dates."})})})]})})]}),e.jsx(Ne,{isOpen:B,onClose:X,room:A,checkInDate:g,checkOutDate:b,onSuccess:W}),y&&e.jsx("div",{className:"fixed top-4 right-4 z-50",children:e.jsxs("div",{className:`p-4 rounded-lg border ${y.type==="success"?"bg-green-50 border-green-200 text-green-800":"bg-red-50 border-red-200 text-red-800"} flex items-start gap-3 shadow-lg max-w-md`,children:[e.jsx("div",{className:"flex-1",children:e.jsx("p",{className:"font-medium",children:y.message})}),e.jsx("button",{onClick:n,className:"text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0",children:"×"})]})})]})}export{Re as default};
