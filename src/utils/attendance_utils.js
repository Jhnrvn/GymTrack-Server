const biometricEnrollment = (members) => {
  if (members.length === 0) return 0;
  const enrolled = members.filter((member) => {
    return member.isEnrolled;
  }).length;

  const notEnrolled = members.filter((member) => {
    return !member.isEnrolled;
  }).length;

  return { enrolled, notEnrolled };
};
const totalTrainers = (members) => {
  if (members.length === 0) return 0;
  return members.filter((member) => member.member_type === "Trainer").length;
};

const totalMembers = (members) => {
  if (members.length === 0) return 0;
  return members.filter((member) => member.member_type === "Member").length;
};

const countMale = (members) => {
  if (members.length === 0) return 0;
  return members.filter((member) => member.gender === "Male").length;
};

const countFemale = (members) => {
  if (members.length === 0) return 0;
  return members.filter((member) => member.gender === "Female").length;
};

const countDoneSession = (members) => {
  const now = new Date().setHours(0, 0, 0, 0);

  if (members.length === 0) return 0;

  const doneSession = members.filter((member) => {
    const memberAtt = member.attendance.filter((att) => {
      if (att.time_out) {
        const attDate = new Date(att?.time_out).setHours(0, 0, 0, 0);
        if (attDate === now) return att;
      }
    });

    if (memberAtt.length > 0) return memberAtt[0];
  });

  return doneSession.length;
};

const countWorkingOut = (members) => {
  const now = new Date().setHours(0, 0, 0, 0);

  if (members.length === 0) return 0;

  const doneSession = members.filter((member) => {
    const memberAtt = member.attendance.filter((att) => {
      if (att.time_in && !att.time_out) {
        const attDate = new Date(att?.time_in).setHours(0, 0, 0, 0);
        if (attDate === now) return att;
      }
    });

    if (memberAtt.length > 0) return memberAtt[0];
  });

  return doneSession.length;
};

const countNotVisited = (members) => {
  if (members.length === 0) return 0;

  const notVisited = members.filter((member) => {
    const memberAtt = member.attendance.filter((att) => {
      const attDate = new Date(att?.time_in).setHours(0, 0, 0, 0);
      if (attDate === new Date().setHours(0, 0, 0, 0)) {
        return att;
      }
      return;
    });

    if (!memberAtt[0]?.time_in) return member;
  });

  return notVisited.length;
};

export {
  biometricEnrollment,
  totalTrainers,
  totalMembers,
  countMale,
  countFemale,
  countDoneSession,
  countWorkingOut,
  countNotVisited,
};
