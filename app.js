const express = require("express"); const app = express();
const jwt = require("jsonwebtoken");
const env = require("dotenv");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const request = require("request");
env.config({path:"./sec.env"});
const envData = process.env;
const stripe = require("stripe")(envData.Stripe_SK);
const WebhookSecret = envData.WebhookSecret;
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const fs = require("fs");
const path = require("path");

const msPricing = require("./pricing");



const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const LogAction = async(msg, status, serial) => {
	fs.writeFile(path.join(path.join(__dirname, 'logs'), `${status}_${serial}.log`), msg, (e) => {
		if(e){
			return false;
		}else{
			return true;
		}
	})
}


const webhook = async (req, res) =>
{
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(payload, sig, WebhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if(event.type === 'checkout.session.completed') {
        const session = event.data.object;
        ConfirmTransaction(session);
    }

    res.status(200).json({
        received:true
    });
};


const ConfirmTransaction = async (session) => {

    if(session.payment_status === 'paid'){
		
		var logContent = "";
		
		logContent += "PAYMENT STATUS: PAID \n\n";

        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent); //.amount //.amount_received
        const successUrl = session.success_url;
        const token = successUrl.split("?")[1].split("=")[1];
        try{
            const decoded = await promisify(jwt.verify)(token, envData.JWT_Private_Key);
            const price = msPricing.setPrice(decoded.Model);
            const email = session.customer_details.email;

            if(paymentIntent.amount_received/100 == price){
				
				logContent += "INCOMING PRICE == SERVICE PRICE\n\n";

                const url = "https://scraper.tedddby.com/iremoval/register/"+decoded.SerialNumber;

                const registerSerial = await fetch(url, { method:"GET" })
                .then(res => res.text())
                .then(data => {
                    return data;
                })
                .catch(e => {
                    return "err-"+e.toString();
                });
				
				logContent += "REQUEST SENT! \n\n";

                if(registerSerial.includes("err-")){
					
					logContent += "REQUEST FAILED! +++++++++"+registerSerial+"+++++++++++\n\n";
					await LogAction(logContent, "FAILED", decoded.SerialNumber);
					
                    var embed = new MessageBuilder().setTitle(`[MEID SIGNAL]: FETCH ERROR || URGENT`).addField('SerialNumber', `${decoded.SerialNumber}`).addField('Device Model', `${decoded.Model}`).addField('Customer Email', `${email}`).addField('AMOUNT RECEIVED', `${price}`).setColor("#FF0000").setTimestamp();new Webhook("https://discord.com/api/webhooks/770381246663491606/yGwDb71hoGuvNlanGTb7sJsPDSODw42OrkZ0gqDrVLi3rn3oh6zvr2W9V2WCk2qbEuZk").send(embed);
                }else{
					
					logContent += "REQUEST SUCCESS \n\n";
					
                    if(registerSerial.includes(decoded.SerialNumber)){
						
						logContent += "SERIAL REGISTERED +++++++++"+registerSerial+"++++++++++++ \n\n";
					    await LogAction(logContent, "SUCCESS", decoded.SerialNumber);
						
                        var embed = new MessageBuilder().setTitle(`[MEID SIGNAL]: New Payment Received`).addField('SerialNumber', `${decoded.SerialNumber}`).addField('Device Model', `${decoded.Model}`).addField('Customer Email', `${email}`).addField('AMOUNT RECEIVED', `${price}`).setColor("#00FF00").setTimestamp();new Webhook("https://discord.com/api/webhooks/770381246663491606/yGwDb71hoGuvNlanGTb7sJsPDSODw42OrkZ0gqDrVLi3rn3oh6zvr2W9V2WCk2qbEuZk").send(embed);
                    }else{
						
						logContent += "SERIAL REG FAILED +++++++++++++"+registerSerial+"+++++++++++\n\n";
					    await LogAction(logContent, "FAILED", decoded.SerialNumber);
						
                        var embed = new MessageBuilder().setTitle(`[MEID SIGNAL]: Unknown Error Please Check`).addField('PARMETER', `${registerSerial}`).addField('SerialNumber', `${decoded.SerialNumber}`).addField('Device Model', `${decoded.Model}`).addField('Customer Email', `${email}`).addField('AMOUNT RECEIVED', `${price}`).setColor("#FF0000").setTimestamp();new Webhook("https://discord.com/api/webhooks/770381246663491606/yGwDb71hoGuvNlanGTb7sJsPDSODw42OrkZ0gqDrVLi3rn3oh6zvr2W9V2WCk2qbEuZk").send(embed);
                    }
                }

                return true;

            }else{
				var embed = new MessageBuilder().setTitle(`[MEID SIGNAL]: PRICES ARE DISMATCHED`).addField('SerialNumber', `${decoded.SerialNumber}`).addField('Device Model', `${decoded.Model}`).addField('Customer Email', `${email}`).addField('AMOUNT RECEIVED', `${price}`).addField('EXPECTED AMOUNT', `${decoded.Price}`).setColor("#FF0000").setTimestamp();new Webhook("https://discord.com/api/webhooks/770381246663491606/yGwDb71hoGuvNlanGTb7sJsPDSODw42OrkZ0gqDrVLi3rn3oh6zvr2W9V2WCk2qbEuZk").send(embed);
			}
        }catch{
			await LogAction("JSON WEB TOKEN EXPIRED", "FAILED", "NOxSERIAL");
            return false;
        }
    }
}

app.post("/s/webhook", bodyParser.raw({type: 'application/json'}), webhook);


app.get("*" , (req, res) => {
    return res.send("- 404 -")
})

app.listen(3606, (e) => {
    if (e) console.error(e);
    else console.log("SERVER UP!")
});
