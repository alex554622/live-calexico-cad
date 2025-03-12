
import { Officer, Incident, Notification } from '@/types';
import { officers, updateOfficerStatus } from '../officers';
import { updateIncident } from '../incidents';

export const simulateRealTimeUpdates = (
  onOfficerUpdate: (officer: Officer) => void,
  onIncidentUpdate: (incident: Incident) => void,
  onNewNotification: (notification: Notification) => void
) => {
  const interval = setInterval(() => {
    const randomChoice = Math.random();
    
    if (randomChoice < 0.3) {
      // Update a random officer's status
      const randomOfficerIndex = Math.floor(Math.random() * officers.length);
      const officerToUpdate = officers[randomOfficerIndex];
      
      // Skip off-duty officers
      if (officerToUpdate.status === 'offDuty') return;
      
      const statusChoices: Officer['status'][] = ['available', 'busy', 'responding'];
      const newStatus = statusChoices[Math.floor(Math.random() * statusChoices.length)];
      
      updateOfficerStatus(officerToUpdate.id, newStatus)
        .then(updatedOfficer => {
          onOfficerUpdate(updatedOfficer);
        });
    } else if (randomChoice < 0.5) {
      // Update an incident status
      const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'archived');
      
      if (activeIncidents.length > 0) {
        const randomIncidentIndex = Math.floor(Math.random() * activeIncidents.length);
        const incidentToUpdate = activeIncidents[randomIncidentIndex];
        
        const statusUpdate = Math.random() < 0.5 ? 'active' : 'resolved';
        
        updateIncident(incidentToUpdate.id, { status: statusUpdate })
          .then(updatedIncident => {
            onIncidentUpdate(updatedIncident);
            
            // If resolved, update assigned officers
            if (statusUpdate === 'resolved') {
              updatedIncident.assignedOfficers.forEach(officerId => {
                updateOfficerStatus(officerId, 'available')
                  .then(updatedOfficer => {
                    onOfficerUpdate(updatedOfficer);
                  });
              });
            }
          });
      }
    }
  }, 30000); // Simulate updates every 30 seconds
  
  return () => clearInterval(interval);
};
