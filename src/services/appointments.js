import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore'

import { db } from '../firebase'

const appointmentsCol = (uid) => collection(db, 'users', uid, 'appointments')
const appointmentDoc = (uid, id) => doc(db, 'users', uid, 'appointments', id)

/**
 * Escuta em tempo real os agendamentos do usuário autenticado.
 */
export const subscribeAppointments = (uid, onData, onError) => {
  if (!uid) {
    console.error("Erro: UID do usuário não fornecido para carregar os agendamentos.")
    return () => {}
  }

  return onSnapshot(
    appointmentsCol(uid),
    (snapshot) => {
      try {
        const list = snapshot.docs.map((each) => ({
          id: each.id,
          ...each.data(),
        })).sort((a, b) =>
          `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`)
        )
        onData(list)
      } catch (err) {
        console.error("Erro ao processar dados dos agendamentos:", err)
        if (onError) onError(err)
      }
    },
    (error) => {
      console.error("Erro na escuta do Firestore:", error)
      if (onError) onError(error)
    }
  )
}

/**
 * Adiciona um novo agendamento com marca temporal de criação.
 */
export const addAppointment = async (uid, data) => {
  if (!uid) throw new Error("Usuário não autenticado.")
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  try {
    const docRef = await addDoc(appointmentsCol(uid), payload)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar agendamento:", error)
    throw error
  }
}

/**
 * Atualiza campos específicos do agendamento.
 */
export const updateAppointment = async (uid, id, fields) => {
  if (!uid || !id) throw new Error("Parâmetros inválidos para atualização.")

  const payload = {
    ...fields,
    updatedAt: serverTimestamp()
  }

  try {
    await updateDoc(appointmentDoc(uid, id), payload)
  } catch (error) {
    console.error(`Erro ao atualizar agendamento ${id}:`, error)
    throw error
  }
}

/**
 * Remove um agendamento do banco de dados.
 */
export const removeAppointment = async (uid, id) => {
  if (!uid || !id) throw new Error("Parâmetros inválidos para exclusão.")

  try {
    await deleteDoc(appointmentDoc(uid, id))
  } catch (error) {
    console.error(`Erro ao excluir agendamento ${id}:`, error)
    throw error
  }
}

/**
 * Marca (ou desmarca) o serviço como realizado.
 * Guarda a hora da confirmação para consulta posterior.
 */
export const setAppointmentCompleted = async (uid, id, isCompleted) => {
  if (!uid || !id) throw new Error("Parâmetros inválidos para conclusão.")

  const payload = isCompleted
    ? {isCompleted: true, completedAt: serverTimestamp()}
    : {isCompleted: false, completedAt: deleteField()}

  try {
    await updateAppointment(uid, id, payload)
  } catch (error) {
    console.error(`Erro ao atualizar conclusão do agendamento ${id}:`, error)
    throw error
  }
}
