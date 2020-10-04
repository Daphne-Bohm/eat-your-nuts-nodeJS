/***************************************************************************************************************************
                                                    GLOBAL STUFF
****************************************************************************************************************************/

let cart = document.getElementById('shoppingcart-container');

/***************************************************************************************************************************
 *                                              CHECK LOCALSTORAGE
 *                                              - There is nothing? Then getCookieInformation.
 *                                              - There is something? But new item, add this is to LS.
 *                                              - There is something? No new item, just show.
****************************************************************************************************************************/

function checkLS(){
    if(localStorage.getItem('chosenProducts') === null){

        if(document.cookie){ 

            getCookieInformation();

        }

    }else{
        
        if(document.cookie){ 

            getCookieInformation();

        }else{ 

            displayChosenProducts();
            displayTotal();
            
        }

    }
}

checkLS();

/***************************************************************************************************************************
 *                                                  GET INFO OF COOKIE                      
****************************************************************************************************************************/

function getCookieInformation(){

    let cookie, splittedCookie, id, quantity, name, price, img;

    // Get the cookie
    cookie = document.cookie;

    // Make cookie an array
    splittedCookie = cookie.split('&');

    // Getting the id of the cookie
    id = splittedCookie[0].slice(11, splittedCookie[0].lenght);

    // Getting the quantity of the cookie
    quantity = splittedCookie[1].slice(9, splittedCookie[1].lenght);

    // Getting the price of the cookie
    price = splittedCookie[2].slice(6, splittedCookie[2].lenght);

    // Getting the img of the cookie
    img = splittedCookie[3].slice(4, splittedCookie[3].lenght);

    // Getting the name of the cookie
    nameArray = splittedCookie[4].split('=');
    name = nameArray[1];

    // Place in LS
    saveInLS(id, quantity, price, img, name);

    // Remove the cookie
    removeCookie();

    // Refresh webpage
    window.location.replace("http://localhost:3003/shop/shoppingcart");
    
}

/***************************************************************************************************************************
 *                                                  SAVE IN LS                                      
****************************************************************************************************************************/

function saveInLS(id, qty, price, img, name){

    let chosenProducts;

    // There is nothing in the LS
    if(localStorage.getItem('chosenProducts') === null){
        
        chosenProducts = [];
        chosenProducts.push({id, qty, price, img, name});

    // There is something in the LS
    }else{

        // Get the products from LS
        chosenProducts = JSON.parse(localStorage.getItem('chosenProducts'));

        // First check if new product is already in the LS
        chosenProducts.forEach( product => { 
            if(product.id === id){
                updateProduct = product;
            }
        }) 

        // Get the index of that product for updating the qty
        index = chosenProducts.map( i => {
            return i.id;
        }).indexOf(id);

        if(index !== -1){ // the product is in the LS

            // update the qty
            updateProduct.qty = parseInt(updateProduct.qty) + parseInt(qty);
            chosenProducts[index] = updateProduct;

        }else{ // the product is new
            chosenProducts.push({id, qty, price, img, name});
        }
    }

    localStorage.setItem('chosenProducts', JSON.stringify(chosenProducts));
    
}

/***************************************************************************************************************************
 *                                                  REMOVE COOKIE                                            
****************************************************************************************************************************/

function removeCookie(){
    document.cookie = "product=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}

/***************************************************************************************************************************
 *                                                  DISPLAY                                          
****************************************************************************************************************************/

function displayChosenProducts(){

    let id, qty, price, img, name, totalPriceItem;

    chosenProducts = JSON.parse(localStorage.getItem('chosenProducts'));

    let cartRow;
    
    chosenProducts.forEach( product => {
        
        id = product.id;
        qty = product.qty;
        price = product.price;
        img = product.img;
        name = product.name;

        totalPriceItem = (price * qty).toFixed(2);

        cartRow = document.createElement('tr');
        cartRow.classList.add('row');

        cartRow.innerHTML = `
        
            <td class="col-5 item product-${id}">
                <h4>${name}</h4>
                <img src="../img/${img}.jpg" alt="${name}" width="200" height="auto">
                <br>
                <button class="removeBtn">remove</button>
            </td>
            <td class="col-2 item-price d-flex align-items-center">
                € ${price}
            </td>
            <td class="col-3 item-quantity d-flex align-items-center">
                ${qty}
            </td>
            <td class="col-2 item-total d-flex align-items-center">
                € ${totalPriceItem}
            </td>
        </td>
        
        `

        cart.append(cartRow)

    })

}

function displayTotal(){

    let price, qty, totalPriceItem, totalPrice, size;
    let arrayPrices = [];
    let displayTotal = document.querySelector('.subtotal-price');

    // Get the products
    let chosenProducts = JSON.parse(localStorage.getItem('chosenProducts'));

    // Getting the size of the chosenProducts object -> make array and get length
    size = Object.keys(chosenProducts).length;

    if(size > 1){

        chosenProducts.forEach(product => {
        
            totalPriceItem = product.price * product.qty;

            arrayPrices.push(totalPriceItem)

            console.log(totalPriceItem);

        })

        // Get the total amount
        arrayPrices.reduce((acc, current) => {
            totalPrice = acc + current;
            console.log(totalPrice);
        })

        // Display total amount
        displayTotal.innerText = '€ ' + totalPrice.toFixed(2);

    }else{

        totalPriceItem = (chosenProducts[0].price) * (chosenProducts[0].qty);
        displayTotal.innerText = '€ ' + totalPriceItem.toFixed(2);

    }

}

/***************************************************************************************************************************
 *                                                    REMOVE PRODUCT                                       
****************************************************************************************************************************/

function removeProduct(target){

    // Getting the right product
    const productRemoveBtn = target;
    const parentElement = productRemoveBtn.parentElement.parentElement;

    // Remove from the DOM
    parentElement.remove();

    // Remove from the LS 
    removeFromLS(parentElement);

    // Refresh webpage
    window.location.replace("http://localhost:3003/shop/shoppingcart");

}

function removeFromLS(parent){

    // Get the product id
    let chosenProducts = JSON.parse(localStorage.getItem('chosenProducts')); // getting all products from LS
    let getClass = parent.children[0].getAttribute('class'); // Get the class attribute --> example: col-5 item product-1
    let getID = getClass.slice(19, getClass.lenght); // Gives the id from the class attribute --> example: 1

    // Get the index of the item from the array
    let index = chosenProducts.map( i => {
        return i.id;
    }).indexOf(getID); // gives the array index place --> example: 0 

    chosenProducts.splice(index, 1); // index gives the position in the array, the 1 stands for how many -> removes the element from the array

    // Update the LS
    localStorage.setItem('chosenProducts', JSON.stringify(chosenProducts));

}

cart.addEventListener('click', e => {
    let target = e.target;

    if(target.classList[0] === 'removeBtn'){
        removeProduct(target);
    }

})