from django.db import models
from django.contrib.auth.models import User
from core.models import Project


class PartnerMessage(models.Model):
    """
    Model for messages between partners and administrators
    """
    SENDER_CHOICES = [
        ('admin', 'Administrator'),
        ('partner', 'Partner'),
    ]
    
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
    ]
    
    # Message details
    subject = models.CharField(max_length=255)
    content = models.TextField()
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_partner_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_partner_messages')
    
    # File attachment
    attachment = models.FileField(upload_to='partnership_attachments/', blank=True, null=True)
    
    # Message status and tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    # Project association (optional)
    related_project = models.ForeignKey(Project, on_delete=models.SET_NULL, blank=True, null=True, related_name='partnership_messages')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Partner Message'
        verbose_name_plural = 'Partner Messages'
        
    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.subject[:50]}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.status = 'read'
            self.save()


class PartnerProjectAssignment(models.Model):
    """
    Model for assigning projects to partners for collaboration
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    ROLE_CHOICES = [
        ('implementer', 'Project Implementer'),
        ('supporter', 'Project Supporter'),
        ('advisor', 'Project Advisor'),
        ('sponsor', 'Project Sponsor'),
    ]
    
    # Assignment details
    partner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_assignments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='partner_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_partnerships')
    
    # Role and status
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='implementer')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Assignment notes and terms
    assignment_notes = models.TextField(blank=True, help_text="Notes about the partnership assignment")
    terms_and_conditions = models.TextField(blank=True, help_text="Specific terms for this partnership")
    
    # Timeline
    start_date = models.DateField(blank=True, null=True)
    expected_end_date = models.DateField(blank=True, null=True)
    actual_end_date = models.DateField(blank=True, null=True)
    
    # Response tracking
    response_date = models.DateTimeField(blank=True, null=True)
    response_notes = models.TextField(blank=True, help_text="Partner's response to the assignment")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Partner Project Assignment'
        verbose_name_plural = 'Partner Project Assignments'
        unique_together = ['partner', 'project']  # Prevent duplicate assignments
        
    def __str__(self):
        # Project model usa 'name' (não 'title')
        return f"{self.partner.username} - {getattr(self.project, 'name', 'Projeto')} ({self.role})"
    
    def accept_assignment(self, response_notes=""):
        """Accept the project assignment"""
        from django.utils import timezone
        self.status = 'accepted'
        self.response_date = timezone.now()
        self.response_notes = response_notes
        self.save()
    
    def reject_assignment(self, response_notes=""):
        """Reject the project assignment"""
        from django.utils import timezone
        self.status = 'rejected'
        self.response_date = timezone.now()
        self.response_notes = response_notes
        self.save()
    
    def complete_assignment(self):
        """Mark assignment as completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.actual_end_date = timezone.now().date()
        self.save()
