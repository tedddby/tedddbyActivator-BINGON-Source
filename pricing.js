const setPrice = (modelVersion) => {

    var price = 0;

    if(modelVersion.includes("iPhone 5S") || modelVersion == "iPhone 5S"){
        price = 22;
      }else{
        if(modelVersion.includes("iPhone 6 ") || modelVersion == "iPhone 6"){
          price = 27;
        }else{
          if(modelVersion.includes("iPhone 6 Plus") || modelVersion == "iPhone 6 Plus"){
            price = 27;
          }else{
            if(modelVersion.includes("iPhone 6S") || modelVersion == "iPhone 6S"){
              price = 32;
            }else{
              if(modelVersion.includes("iPhone 6S Plus") || modelVersion == "iPhone 6S Plus"){
                price = 32;
              }else{
                if(modelVersion.includes("iPhone 7") || modelVersion == "iPhone 7"){
                  price = 42;
                }else{
                  if(modelVersion.includes("iPhone 7 Plus") || modelVersion == "iPhone 7 Plus"){
                    price = 42;
                  }else{
                    if(modelVersion.includes("iPhone 8") || modelVersion == "iPhone 8"){
                      price = 52;
                    }else{
                      if(modelVersion.includes("iPhone 8 Plus") || modelVersion == "iPhone 8 Plus"){
                        price = 52;
                      }else{
                        if(modelVersion.includes("iPhone X") || modelVersion == "X"){
                          price = 62;
                        }else{
                          if(modelVersion.includes("iPad")){
                            price = 42;
                          }else{
                            price = 100;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

    return price;
}

module.exports = { setPrice }