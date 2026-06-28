import prisma from "./prisma";

export async function seedTherapistsIfEmpty() {
  try {
    const count = await prisma.therapist.count();
    if (count > 0) {
      return;
    }

    const dummyTherapists = [
      {
        name: "Dr. Sarah Jenkins",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
        specialties: ["Anxiety", "Depression", "CBT (Cognitive Behavioral Therapy)"],
        languages: ["English", "Spanish"],
        acceptingClients: true,
        avgRating: 4.9,
        pricePerSession: 150,
        bio: "Dr. Jenkins is a clinical psychologist with over 10 years of experience specializing in cognitive behavioral therapy for anxiety, panic disorders, and depression.",
      },
      {
        name: "Marcus Chen, LMFT",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
        specialties: ["Relationship Issues", "Family Counseling", "Stress Management"],
        languages: ["English", "Mandarin"],
        acceptingClients: true,
        avgRating: 4.8,
        pricePerSession: 130,
        bio: "Marcus specializes in relationship patterns, family dynamics, and mindfulness-based stress reduction. He provides a warm, collaborative environment.",
      },
      {
        name: "Elena Rostova, LCSW",
        image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
        specialties: ["Trauma & PTSD", "Grief & Loss", "EMDR"],
        languages: ["English", "Russian"],
        acceptingClients: true,
        avgRating: 4.95,
        pricePerSession: 160,
        bio: "Elena is a trauma-informed therapist certified in EMDR. She supports clients navigating deep grief, trauma recovery, and difficult life transitions.",
      },
      {
        name: "Dr. David K. Vance, PsyD",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
        specialties: ["Addiction Recovery", "Anger Management", "CBT"],
        languages: ["English"],
        acceptingClients: true,
        avgRating: 4.7,
        pricePerSession: 140,
        bio: "Dr. Vance specializes in addiction counseling, behavioral modifications, and anger management. He takes a pragmatic, goal-oriented therapeutic approach.",
      },
      {
        name: "Sonia Patel, LMHC",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
        specialties: ["Self-Esteem", "Career Counseling", "Mindfulness"],
        languages: ["English", "Hindi"],
        acceptingClients: false, // Not accepting clients to verify matching constraint
        avgRating: 4.85,
        pricePerSession: 120,
        bio: "Sonia Patel helps professionals navigate career burnout, self-esteem challenges, and work-life balance using client-centered therapy and mindfulness techniques.",
      }
    ];

    await prisma.therapist.createMany({
      data: dummyTherapists,
    });
    console.log("Database successfully seeded with therapists.");
  } catch (error) {
    console.error("Failed to seed therapists:", error);
  }
}
