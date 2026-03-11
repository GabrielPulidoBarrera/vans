      import Alpine from 'alpinejs'
      import collapse from '@alpinejs/collapse'
    Alpine.plugin(collapse)
    Alpine.start()

function guardar(talla: any, producto: any){
Alpine.store('carrito', {
    talla: talla,
    producto: producto
})
}

export{guardar};

function leer(){
    return (Alpine.store('carrito'))
}