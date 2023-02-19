// Lo importante de este proyecto es el aprendizaje de buenas prácticas al momento de usar clases. También tiene LocalStorage.




//// Variables y Selectores ////
const formulario = document.getElementById('agregar-gasto');
const listaGastos = document.querySelector('#gastos ul');
let presupuesto; // Luego, en la función registrarPresupuesto, adquirirá las categorías del constructor de la class Presupuesto.
const reset = document.querySelector('#resetBtn');






//// Eventos ////
eventListeners();
function eventListeners() {
     // Al cargar la página...
     document.addEventListener('DOMContentLoaded', () => {
          const item = localStorage.getItem('presupuesto');
          if (item) {
               console.log('Datos obtenidos por LocalStorage');

               presupuesto = new Presupuesto(JSON.parse(localStorage.getItem('presupuesto')));

               presupuesto.gastos = JSON.parse(localStorage.getItem('gastos')) || [];

               presupuesto.total = JSON.parse(localStorage.getItem('presupuesto'));

               presupuesto.restante = JSON.parse(localStorage.getItem('restante'));

               ui.crearListaGastos(presupuesto.gastos);

               ui.insertarValores();

               ui.comprobarRestante();

               return;
          }
          registrarPresupuesto();
     });


     // Al hacer click en el botón 'Agregar'...
     formulario.addEventListener('submit', validarForm);
     reset.addEventListener('click', reiniciar);
}







//// Funciones ////

function reiniciar(e) {
     e.preventDefault();
     localStorage.removeItem('gastos');
     localStorage.removeItem('presupuesto');
     localStorage.removeItem('restante');
     window.location.reload();
}



function registrarPresupuesto() {
     const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

     // Si el presupuesto escrito es inválido:
     if (!presupuestoUsuario || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
          return window.location.reload();
     }


     // Si el presupuesto escrito es válido:

     // Le otorgamos a la variable 'presupuesto' las categorías del object constructor 'Presupuesto':
     presupuesto = new Presupuesto(presupuestoUsuario);

     // ejecutamos la siguiente función del ui:
     ui.insertarValores();

     sincronizarStorage();
}



function validarForm(e) {
     e.preventDefault();


     // Leer los valores de los input.
     const nombreGasto = document.querySelector('#gasto').value.trim();
     const cantidad = Number(document.querySelector('#cantidad').value.trim());


     // Validación
     const alertaAnterior = document.querySelector('.alerta');
     if (alertaAnterior) {
          alertaAnterior.remove();
     }

     if (nombreGasto == '' || cantidad == '') {
          ui.imprimirAlerta('Ambos campos son obligatorios.', 'error');
     }
     else if ((isNaN(cantidad) || cantidad <= 0) && !isNaN(nombreGasto)) {
          ui.imprimirAlerta('Nombre y cantidad no válidos.', 'error');
     }
     else if (isNaN(cantidad) || cantidad <= 0) {
          ui.imprimirAlerta('La cantidad debe ser un número correcto.', 'error');
     }
     else if (!isNaN(nombreGasto)) {
          ui.imprimirAlerta('El nombre del gasto no es válido.', 'error');
     }
     else if (presupuesto.restante <= 0) {
          ui.imprimirAlerta('Dinero restante insuficiente.', 'error');
     } else {
          agregarGasto(nombreGasto, cantidad);
     }
     sincronizarStorage();
}



function agregarGasto(nombreGasto, cantidad) {

     ui.imprimirAlerta('Gasto cargado correctamente.', 'correcto');

     formulario.reset();

     // Crea un objeto con el nombre, la cantidad y un id:
     const objetoGasto = { nombreGasto, cantidad, id: Date.now() };

     // La siguiente función agrega el objetoGasto en el array 'presupuesto.gastos' y luego ejecuta otra función que actualiza el Restante:
     presupuesto.nuevoGasto(objetoGasto);

     // La siguiente función agrega al recién actualizado array 'presupuesto.gastos' en la lista de gastos:
     ui.agregarGastoAlListado(objetoGasto);
}



function sincronizarStorage() {
     // Actualiza el Array 'presupuesto.gastos' en el localStorage.

     localStorage.setItem('gastos', JSON.stringify(presupuesto.gastos));
     localStorage.setItem('presupuesto', JSON.stringify(presupuesto.total));
     localStorage.setItem('restante', JSON.stringify(presupuesto.restante));
}








//// Clases ////

class Presupuesto {
     // Clase destinada a calcualar el 'Restante'.

     constructor(presupuestoUsuario) {
          this.total = Number(presupuestoUsuario),
               this.restante = Number(presupuestoUsuario),
               this.gastos = []
     }


     nuevoGasto(objetoGasto) {
          // Con 'this' hacemos referencia a la class 'Presupuesto'.
          // 'this.gastos' es un array.
          this.gastos = [...this.gastos, objetoGasto];
          this.calcularRestante();
     }


     calcularRestante() {
          const gastado = this.gastos.reduce((a, objetoGasto) => a + objetoGasto.cantidad, 0);
          // si la función se ejecuta en borrarGasto(), la variable 'gastado' será 0.

          this.restante = this.total - gastado;

          ui.actualizarRestante();
          ui.comprobarRestante();
     }


     borrarGasto(id, cantidad) {
          // Se ejecuta en ui.agregarGastoAlListado() (al hacer click sobre el botón de borrar).

          // Filtrar el array presupuesto.gastos para que no contenga al objetoGasto seleccionado:
          this.gastos = this.gastos.filter(elemento => elemento.id !== id);

          // Actualizar y comprobar el Restante:
          this.calcularRestante();

          // Eliminar el objetoGasto del HTML:
          document.querySelector(`[data-id="${id}"]`).remove();

          sincronizarStorage();
     }
}




class UI {
     // Clase destinada a la interfaz de usuario.

     insertarValores() {
          // Agregar al HTML el valor del presupuesto total y del restante:
          document.querySelector('#total').textContent = presupuesto.total;
          this.actualizarRestante();
     }


     actualizarRestante() {
          document.querySelector('#restante').textContent = Number(presupuesto.restante);
     }


     comprobarRestante() {
          // Cambiar color a Restante:
          const restante = document.querySelector('.restante');

          if (presupuesto.restante <= presupuesto.total * 0.25) {
               restante.classList.remove('alert-warning', 'alert-success');
               restante.classList.add('alert-danger');
          }
          else if (presupuesto.restante <= presupuesto.total * 0.5) {
               restante.classList.remove('alert-danger', 'alert-success');
               restante.classList.add('alert-warning');
          }
          else {
               restante.classList.remove('alert-warning', 'alert-danger');
               restante.classList.add('alert-success');
          }


          // Deshabilitar botón de 'Agregar' si el presupuesto es menor o igual a 0:
          if (presupuesto.restante <= 0) {
               this.imprimirAlerta('El presupuesto se ha agotado', 'error');
               formulario.querySelector('button[type="submit"]').disabled = true;
          } else {
               formulario.querySelector('button[type="submit"]').disabled = false;
          }
     }


     imprimirAlerta(texto, tipo) {
          const divAlerta = document.createElement('DIV');

          divAlerta.classList.add('text-center', 'alert', 'alerta', 'mt-3');
          if (tipo === 'error') {
               divAlerta.classList.add('alert-danger');
          } else {
               divAlerta.classList.add('alert-success');
          }

          divAlerta.textContent = texto;

          // document.querySelector('.primario').insertBefore(divAlerta, formulario);

          formulario.appendChild(divAlerta)

          setTimeout(() => {
               divAlerta.remove();
          }, (3000))
     }


     agregarGastoAlListado(objetoGasto) {
          // Destructuring del objetoGasto creado en la función agregarGasto():
          const { nombreGasto, cantidad, id } = objetoGasto;

          // Creamos un elemento 'li' con clases y un atributo 'data-id';
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.dataset.id = id;
          // Insertamos el nombre y la cantidad con clases:
          li.innerHTML = `${nombreGasto} <span class='badge badge-primary badge-pill'> $${cantidad} </span>`;

          // Botón para borrar el gasto:
          const btnBorrar = document.createElement('div');
          btnBorrar.classList.add('borrar-gasto');
          btnBorrar.textContent = 'X';
          li.appendChild(btnBorrar);
          btnBorrar.onclick = () => presupuesto.borrarGasto(id, cantidad);

          // Agregar el elemento 'li' en el HTML:
          listaGastos.appendChild(li);
     }


     crearListaGastos(arrayGastos) {
          this.limpiarHTML();

          arrayGastos.forEach(objetoGasto => {
               this.agregarGastoAlListado(objetoGasto);
          });
     }
     

     limpiarHTML() {
          while (listaGastos.firstChild) {
               listaGastos.firstChild.remove();
          }
     }
}

const ui = new UI();