// Obtener historial
function obtenerHistorial() {
    const historial = localStorage.getItem('historialPacientes');
    return historial ? JSON.parse(historial) : [];
}

// Renderizar historial
function renderizarHistorial() {
    const historial = obtenerHistorial();
    const contenedor = document.getElementById('historialLista');
    const btnEliminarHistorial = document.getElementById('btn-eliminar-historial');
    const tabla = document.getElementById('tabla-historial');
    const tablaBody = document.getElementById('tabla-historial-body');

    if (historial.length === 0) {
        contenedor.innerHTML = '<div class="mensaje-cola-vacia">No hay pacientes atendidos en el historial</div>';
        tabla.style.display = "none";
        btnEliminarHistorial.style.display = "none";

        return;
    }

    const historialOrdenado = [...historial].reverse();
    tablaBody.innerHTML = historialOrdenado.map(paciente => `    
        <tr>
            <td>${paciente.nombre}</td>
            <td>${paciente.dni}</td>
            <td>${paciente.motivo}</td>
            <td>${paciente.guardia}</td>
            <td>${paciente.fechaAtencion}</td>
        </tr>
            `).join('');
}

function eliminarHistorial() {
    Swal.fire({
        title: 'Eliminar historial de pacientes',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#718096'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('historialPacientes');
            
            renderizarHistorial();
            
            Swal.fire({
                icon: 'success',
                title: 'Historial eliminado',
                text: 'El historial de pacientes ha sido eliminado correctamente.',
                confirmButtonColor: '#667eea'
            });

        }
    });
    
}

renderizarHistorial();
