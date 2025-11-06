const relojIconoUrl = '"http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"'


//generar id para cada paciente
function generarId() {
let contador = Number(localStorage.getItem('contadorId')) || 0;
contador++;
localStorage.setItem('contadorId', contador);
return "PAC-" + contador;
}


function obtenerListaEspera() {
    const lista = localStorage.getItem('listaEspera');
    return lista ? JSON.parse(lista) : [];
}

function guardarListaEspera(lista) {
    localStorage.setItem('listaEspera', JSON.stringify(lista));
}

function obtenerHistorial() {
    const historial = localStorage.getItem('historialPacientes');
    return historial ? JSON.parse(historial) : [];
}

function guardarHistorial(historial) {
    localStorage.setItem('historialPacientes', JSON.stringify(historial));
}

// para la validacion de nombres y dni tuve que indagar en fuentes externas y temrine usando expresiones regulares.
function validarNombre(nombre) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(nombre) && nombre.trim().length > 0;
}

function validarDNI(dni) {
    const regex = /^\d{7,8}$/;
    return regex.test(dni);
}

function dniExiste(dni) {
    const listaEspera = obtenerListaEspera();
    return listaEspera.some(p => p.dni === dni);
}


function renderizarLista() {
    const lista = obtenerListaEspera();
    const contenedor = document.getElementById('listaPacientes');

    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="mensaje-cola-vacia">No hay pacientes en la lista de espera</div>';
        return;
    }


    contenedor.innerHTML = lista.map(paciente => `
                <div class="card-paciente">

                    <div class="paciente-header">

                        <span class="nombre-paciente">${paciente.nombre}</span>

                        <span class="paciente-hora"><svg class="reloj" xmlns=${relojIconoUrl}/> </svg> ${paciente.hora}</span>

                    </div>

                    <div class="paciente-info">

                        <p><strong>DNI:</strong> ${paciente.dni}</p>
                        <p><strong>Motivo:</strong> ${paciente.motivo}</p>
                        <p><span class="tipo-guardia">${paciente.guardia}</span></p>

                    </div>

                    <div class="acciones-paciente-existente">

                        <button class="btn-editar" onclick="editarPaciente('${paciente.id}')">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarPaciente('${paciente.id}')">Eliminar</button>

                    </div>
                </div>
            `).join('');
}

// Para que el formulario cambie de contenido dependiendo si se edita o agrega tambien tuve que buscar en fuentes externas, y preferi poner aqui las posibles guardias para no ensuciar otro lado, porque solo se usa aqui
function agregarPaciente(pacienteEditar = null) {
    const esEdicion = pacienteEditar !== null;

    Swal.fire({
        title: esEdicion ? 'Editar paciente' : 'Agregar paciente',
        html: `
                    <div class = "swal-formulario">

                        <p class = "txt-header-form">Ingrese los datos del paciente para ${esEdicion ? 'actualizar su información' : 'agregarlo a la cola de espera'}.</p>
                        
                        <label class="label-formulario">Nombre completo</label>
                        <input id="nombre" class="swal2-input input-formulario" placeholder="Ingrese nombre del paciente" value="${esEdicion ? pacienteEditar.nombre : ''}">
                        
                        <label class="label-formulario">DNI</label>
                        <input id="dni" class="swal2-input input-formulario" placeholder="Ingrese número de DNI sin puntos ni espacios" value="${esEdicion ? pacienteEditar.dni : ''}" ${esEdicion ? 'disabled' : ''}>
                        
                        <label class= "label-formulario">Motivo de consulta</label>
                        <input id="motivo" class="swal2-input input-formulario" placeholder="Ingrese el motivo de consulta" value="${esEdicion ? pacienteEditar.motivo : ''}">
                        
                        <label class= "label-formulario">Guardia</label>
                        <select id="guardia" class="swal2-input input-formulario">
                            <option value="">Seleccione una guardia</option>
                            <option value="Clínica - Dr. García" ${esEdicion && pacienteEditar.guardia === 'Clínica - Dr. García' ? 'selected' : ''}>Clínica - Dr. García</option>
                            <option value="Cardiológica - Dra. Martínez" ${esEdicion && pacienteEditar.guardia === 'Cardiológica - Dra. Martínez' ? 'selected' : ''}>Cardiológica - Dra. Martínez</option>
                            <option value="Pediátrica - Dr. López" ${esEdicion && pacienteEditar.guardia === 'Pediátrica - Dr. López' ? 'selected' : ''}>Pediátrica - Dr. López</option>
                            <option value="Traumatológica - Dr. Rodríguez" ${esEdicion && pacienteEditar.guardia === 'Traumatológica - Dr. Rodríguez' ? 'selected' : ''}>Traumatológica - Dr. Rodríguez</option>
                            <option value="Urgencias - Dra. Fernández" ${esEdicion && pacienteEditar.guardia === 'Urgencias - Dra. Fernández' ? 'selected' : ''}>Urgencias - Dra. Fernández</option>
                        </select>
                    </div>
                `,
        confirmButtonText: 'Confirmar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#380fccd5',
        cancelButtonColor: '#f84949',
        width: '600px',
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value.trim();
            const dni = document.getElementById('dni').value.trim();
            const motivo = document.getElementById('motivo').value.trim();
            const guardia = document.getElementById('guardia').value;

            
            if (!nombre || !dni || !motivo || !guardia) {
                Swal.showValidationMessage('Por favor complete todos los campos');
                return false;
            }

            if (!validarNombre(nombre)) {
                Swal.showValidationMessage('El nombre no puede contener números ni caracteres especiales');
                return false;
            }

            if (!validarDNI(dni)) {
                Swal.showValidationMessage('El DNI debe contener solo números (7-8 dígitos)');
                return false;
            }

            if (!esEdicion && dniExiste(dni)) {
                Swal.showValidationMessage('Este DNI ya se encuentra en la lista de espera.');
                return false;
            }

            return { nombre, dni, motivo, guardia };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const lista = obtenerListaEspera();

            // Actualiza el paciente ya existente, sino agrega uno nuevo. aca tambien tuve que buscar sobre todo en el findIndex
            if (esEdicion) {
                const index = lista.findIndex(p => p.id === pacienteEditar.id);
                if (index !== -1) {
                    lista[index] = {
                        ...lista[index],
                        nombre: result.value.nombre,
                        motivo: result.value.motivo,
                        guardia: result.value.guardia
                    };
                }
            } else {
                const nuevoPaciente = {
                    id: generarId(),
                    nombre: result.value.nombre,
                    dni: result.value.dni,
                    motivo: result.value.motivo,
                    guardia: result.value.guardia,
                    hora: new Date().toLocaleTimeString('es-AR')
                };
                lista.push(nuevoPaciente);
            }

            guardarListaEspera(lista);
            renderizarLista();

            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Paciente actualizado' : 'Paciente agregado',
                text: `${result.value.nombre} ha sido ${esEdicion ? 'actualizado' : 'agregado a la lista de espera'}`,
                confirmButtonColor: '#5163c9ff'
            });
        }
    });
}

function atenderPaciente() {
    const lista = obtenerListaEspera();

    if (lista.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Lista vacía',
            text: 'No hay pacientes en la lista de espera',
            confirmButtonColor: '#667eea'
        });
        return;
    }

    const primerPaciente = lista[0];

    Swal.fire({
        title: 'Atención Clínica',
        html: `<p class="txt-atender-form">¿Atender paciente: <strong>${primerPaciente.nombre}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Atender',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            lista.shift();
            guardarListaEspera(lista);

            // Agregar al historial
            const historial = obtenerHistorial();
            historial.push({
                ...primerPaciente,
                fechaAtencion: new Date().toLocaleString('es-AR')
            });
            guardarHistorial(historial);

            renderizarLista();

            Swal.fire({
                icon: 'success',
                title: 'Paciente atendido',
                text: 'Paciente registrado en el historial.',
                confirmButtonColor: '#667eea'
            });
        }
    });
}

function editarPaciente(id) {
    const lista = obtenerListaEspera();
    const paciente = lista.find(p => p.id === id);

    if (paciente) {
        agregarPaciente(paciente);
    }
}

function eliminarPaciente(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción eliminará al paciente de la lista de espera y no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#718096'
    }).then((result) => {
        if (result.isConfirmed) {
            let lista = obtenerListaEspera();
            lista = lista.filter(p => p.id !== id);
            guardarListaEspera(lista);
            renderizarLista();

            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El paciente ha sido eliminado de la lista',
                confirmButtonColor: '#667eea'
            });
        }
    });
}

function verHistorial() {
    window.location.href = 'historial.html';
}

renderizarLista();
